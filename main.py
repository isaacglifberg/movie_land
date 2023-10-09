import bcrypt
from fastapi import FastAPI, Depends, HTTPException, status, Cookie
from datetime import datetime, timedelta
from sql_app.schemas import Token_data, Token, Test_user, LoginResponseModel
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sql_app import database
from sql_app import schemas
from fastapi.responses import JSONResponse
from password_strength import PasswordPolicy


from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "3c7b0ad089046e732b2efa7a47bc0d7e7c56c81ca6f12933e66551273d2e37e9"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTE = 30


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
salt = bcrypt.gensalt()

app = FastAPI()

policy = PasswordPolicy.from_names(
    length=8,  # Minimum length
    uppercase=1,  # Require at least one uppercase letter
    numbers=1,    # Require at least one digit
    special=1,    # Require at least one special character
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def start_db():
    async with database.engine.begin() as conn:
        await conn.run_sync(database.Base.metadata.create_all)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


async def get_user(db: AsyncSession, username: str) -> database.User:
    result = await db.execute(select(database.User).filter_by(username=username))
    return result.scalars().first()


async def authenticate_user(db: AsyncSession, username: str, password: str) -> database.User:
    user = await get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


# jwt-token
def create_access_token(data: dict, expires_delta: timedelta or None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(db: AsyncSession = Depends(database.get_db), token: str = Depends(oauth2_scheme)) -> database.User:
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                         detail="Could not validate credentials", headers={"WWW.authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credential_exception
        token_data = Token_data(username=username)
    except JWTError:
        raise credential_exception
    user = await get_user(db, username=token_data.username)
    if user is None:
        raise credential_exception
    return user


async def get_current_active_user(current_user: database.User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@app.post("/register")
async def create_user(user: schemas.Test_user, db: AsyncSession = Depends(database.get_db)):
    email_user = await db.execute(select(database.User).filter_by(email=user.email))
    email_user = email_user.scalar()
    username_user = await db.execute(
        select(database.User).filter_by(username=user.username))
    username_user = username_user.scalar()
    if email_user or username_user:
        raise HTTPException(
            status_code=400, detail='Email or username already exists')
    if not policy.test(user.password):
        raise HTTPException(status_code=400, detail="Password is too weak")
    crypted_password = get_password_hash(user.password)
    new_user = database.User(username=user.username,
                             email=user.email, hashed_password=crypted_password)
    db.add(new_user)
    await db.commit()
    db.refresh(new_user)
    return {"message": "user created successfully"}


@app.get("/users/me", response_model=Test_user)
async def read_users_me(current_user: Test_user = Depends(get_current_active_user)):
    return current_user


@app.post('/login', response_model=LoginResponseModel)
async def login(request: schemas.requestdetails, db: AsyncSession = Depends(database.get_db)):
    user = await authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect username or password", headers={"WWW.authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTE)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires)
    response = JSONResponse(content={"message": "Logged in"})
    response.set_cookie(key="some_value", value=access_token,
                        httponly=False, samesite="Lax", secure=False, max_age=1800)
    return response


@app.post('/add_movie')
async def add_movie(request: schemas.User_movies, current_user: str = Depends(get_current_user),  db: AsyncSession = Depends(database.get_db)):
    existing_movie = await db.execute(
        select(database.UserMovies)
        .filter(
            (database.UserMovies.title == request.title) &
            (database.UserMovies.poster_url == request.movie_poster)
        )
    )
    existing_movie = existing_movie.scalar()
    if existing_movie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Movie already exists in your list."
        )
    new_movie = database.UserMovies(
        title=request.title, poster_url=request.movie_poster)
    movie_list = database.MovieList(user=current_user, movie=new_movie)
    if not new_movie:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="No movie was being added")
    db.add(new_movie)
    db.add(movie_list)
    await db.commit()
    await db.refresh(new_movie)
    return {"message": "movie added successfully"}


@app.post('/delete_movie')
async def delete_movie(request: schemas.DeleteUserMovie, current_user: str = Depends(get_current_user),  db: AsyncSession = Depends(database.get_db)):
    movie = await db.execute(select(database.UserMovies).filter(database.UserMovies.id == request.movie_id))
    movie = movie.scalar()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    movie_list = await db.execute(select(database.MovieList).filter(
        (database.MovieList.user == current_user) & (database.MovieList.movie_id == request.movie_id)))
    movie_list = movie_list.scalar()

    if not movie_list:
        raise HTTPException(
            status_code=401, detail="No permission to delete a movie")

    await db.delete(movie)
    await db.delete(movie_list)

    await db.commit()

    return {"message": "Movie deleted successfully", "movie_id": request.movie_id}


@app.get('/user_movies')
async def get_user_movies(current_user: database.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    try:
        stmt = select(database.UserMovies).filter(
            database.UserMovies.movie_lists.any(user_id=current_user.id)
        )
        user_movies = await db.execute(stmt)
        return user_movies.scalars().all()
    except Exception as e:
        return {"Error": str(e)}

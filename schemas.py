from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str

    class Config:
        orm_mode = True


class Token_data(BaseModel):
    username: str or None = None

    class Config:
        orm_mode = True


class requestdetails(BaseModel):
    username: str
    password: str

    class Config:
        orm_mode = True


class Test_user(BaseModel):
    username: str
    email: str
    password: str
    disabled: bool

    class Config:
        orm_mode = True


class User_movies(BaseModel):
    title: str
    movie_poster: str

    class Config:
        orm_mode = True


class LoginResponseModel(BaseModel):
    message: str


class DeleteUserMovie(BaseModel):
    movie_id: int

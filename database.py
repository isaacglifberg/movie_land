

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship
from sqlalchemy import MetaData


SQLALCHEMY_DATABASE_URL = "postgresql+asyncpg://isaacglifberg:?@localhost/test_users"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL
)

Base = declarative_base()


async def get_db():
    session = AsyncSession(engine, expire_on_commit=False)
    try:
        yield session
    finally:
        await session.close()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)

    # Relationship to MovieList (one-to-many)
    movie_lists = relationship("MovieList", back_populates="user")


class UserMovies(Base):
    __tablename__ = "usermovies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    poster_url = Column(String, index=True)

    # Relationship to MovieList (one-to-many)
    movie_lists = relationship("MovieList", back_populates="movie")


class MovieList(Base):
    __tablename__ = "movie_lists"

    id = Column(Integer, primary_key=True, index=True)
    # Foreign key linking to User
    user_id = Column(Integer, ForeignKey("users.id"))
    # Foreign key linking to UserMovies
    movie_id = Column(Integer, ForeignKey("usermovies.id"))

    # Establish a many-to-one relationship between MovieList and User
    user = relationship("User", back_populates="movie_lists")
    # Establish a many-to-one relationship between MovieList and UserMovies
    movie = relationship("UserMovies", back_populates="movie_lists")

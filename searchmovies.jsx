import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";
import Cookies from 'js-cookie';
import BackToTopButton from "./backToTopBotton";



const apiKey = '74d83bc49cf8d13bb61faa6d9bafed91';
const baseUrl = 'https://api.themoviedb.org/3';


const popularMoviesEndpoint = `${baseUrl}/movie/popular?api_key=${apiKey}`;

function SearchMovies() {
    // const [movies, setMovies] = useState([]);
    const [showLoginForm, setShowLoginForm] = useState(false)
    const [showUserMovies, setShowUserMovies] = useState(false)

    const [allMovies, setAllMovies] = useState([]); // All movies
    const [userMovies, setUserMovies] = useState([]); // Saved movies

    const [filteredAllMovies, setFilteredAllMovies] = useState([]);
    const [filteredUserMovies, setFilteredUserMovies] = useState([]);

    const [checkToken, setCheckToken] = useState(false)

    const [deleted, setDeleted] = useState(false)

    const [loggedIn, setLoggedin] = useState(false)

    const [loggedOut, setLoggedOut] = useState(false)


    const searchMovies = async () => {
        const response = await fetch(popularMoviesEndpoint)
        const data = await response.json()
        const test = data.results.map(result => ({ title: result.title, poster: result.poster_path }))
        setAllMovies(test)
        setFilteredAllMovies(test)

    };

    const handleFilter = (event) => {
        const searchWord = event.target.value.toLowerCase();
        const allMoviesList = showUserMovies ? userMovies : allMovies;
        const newMovies = allMoviesList.filter((film) => {
            return film.title.toLowerCase().includes(searchWord);
        });

        if (showUserMovies) {
            setFilteredUserMovies(newMovies);
        } else {
            setFilteredAllMovies(newMovies);
        }
    };

    useEffect(() => {
        searchMovies();
        checkIfCookie();

    }, []);

    const handleClick = () => {
        setShowLoginForm(true)
    }

    const addMovie = async (title, movie_poster) => {
        try {
            const token = Cookies.get('some_value');
            const data = { title, movie_poster }
            const response = await axios.post('http://localhost:8000/add_movie', data, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            });

            console.log('User added movie successfully:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }

    }

    const deleteMovie = async (movie_id) => {
        try {
            const token = Cookies.get('some_value');
            const data = { movie_id }
            const response = await axios.post('http://localhost:8000/delete_movie', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setDeleted(true)
            setTimeout(() => {
                setDeleted(false);
            }, 6000);
            console.log('User deleted movie successfully:', response.data);
            setFilteredUserMovies((prevMovies) =>
                prevMovies.filter((fMovie) => fMovie.id !== movie_id)
            );
        } catch (error) {
            console.error('Error:', error);
        }

    }

    const handleLogOut = async () => {
        try {
            Cookies.remove('some_value')
            setUserMovies([])
            setCheckToken(false)
            setLoggedOut(true)
            setTimeout(() => {
                setLoggedOut(false);
            }, 6000);
        }
        catch (error) {
            console.error('Error:', error);
        }
    }


    const fetchUserMovies = async () => {
        try {
            const token = Cookies.get('some_value');
            const response = await axios.get('http://localhost:8000/user_movies', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('User Movies Response:', response.data);
            setUserMovies(response.data)

        } catch (error) {
            console.error('Error fetching user movies:', error);
        }
    };

    const toggleMoviesDisplay = () => {
        setShowUserMovies(!showUserMovies);
        if (!showUserMovies) {
            fetchUserMovies()
        } else {
            setFilteredUserMovies(userMovies)
        }
    };

    const checkIfCookie = () => {
        const token = Cookies.get('some_value');
        if (token) {
            setCheckToken(true)
            setLoggedin(true)
        }
        else {
            setCheckToken(false)
            setLoggedin(false)
        }
    }

    setTimeout(() => {
        setLoggedin(false);
    }, 7000);
    return (
        <>
            <header className="fixed top-0  mr-10 w-full shadow-md z-10" style={{ backgroundColor: 'rgb(34, 34, 34)' }}>
                <div className="flex justify-center mt-3">
                    {loggedIn ? (
                        <div className="text-sm text-gray-600">
                            You are now logged in
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
                <div className="flex justify-center mt-3">
                    {loggedOut ? (
                        <div className="text-sm text-gray-600">
                            You are now logged out
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
                <div className="title flex justify-center mb-3">
                    <h1 className="mb-2 text-xl font-extrabold leading-none tracking-tight md:text-2xl lg:text-4xl dark:text-white">
                        Movie Land
                    </h1>
                </div>

                <div className="search flex justify-center gap-5 mb-5">
                    <button
                        className="login_button bg-gray-50 border border-gray-300 text-gray-900 w-32 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onClick={toggleMoviesDisplay}
                    >
                        {showUserMovies ? "All Movies" : "Saved Movies"}
                    </button>
                    <input
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 w-64 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 text-center placeholder-center"
                        placeholder="Search movies"
                        onChange={handleFilter}
                    />

                    <div className="flex items-center justify-end">
                        {checkToken ? (
                            <button
                                onClick={handleLogOut}
                                className="login_button bg-gray-50 border border-gray-300 text-gray-900 w-32 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link to="/login">
                                <button
                                    onClick={handleClick}
                                    className="login_button bg-gray-50 border border-gray-300 text-gray-900 w-32 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    Sign In/Up
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex justify-center mt-3">
                    {deleted ? (
                        <div className="text-sm text-gray-600">
                            Movie was deleted
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
            </header >



            <div style={{ marginTop: "10rem" }} className="grid grid-cols-4 gap-4 ml-10 mr-10">

                {showUserMovies
                    ? filteredUserMovies.length > 0
                        ? filteredUserMovies.map((fMovie, index) => (
                            <div key={index} className="max-w-sm rounded overflow-hidden shadow-lg">
                                <img className="w-full " src={`https://image.tmdb.org/t/p/w500/${fMovie.poster_url}`} alt={fMovie.title} />
                                <div className="px-6 py-4 ">
                                    <div className="flex justify-around font-bold text-l ">
                                        <p >{fMovie.title}</p>
                                        <button onClick={() => deleteMovie(fMovie.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>

                        ))
                        : <div className="error"><p className="">No saved movies exist or you are not logged in</p></div>
                    : filteredAllMovies.length > 0
                        ? filteredAllMovies.map((fMovie, index) => (
                            <div key={index} className="max-w-sm rounded overflow-hidden shadow-lg">
                                <img className="w-full" src={`https://image.tmdb.org/t/p/w500/${fMovie.poster}`} alt={fMovie.title} />
                                <div className="px-6 py-4">
                                    <div className="font-bold text-l mb-2 flex gap-9">
                                        <p>{fMovie.title}</p>
                                        {checkToken ? (
                                            <button onClick={() => addMovie(fMovie.title, fMovie.poster)}>Add</button>
                                        ) : (
                                            <div></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                        : <div className="error"><p className="">No movies exist with that title.</p></div>
                }
            </div>
            <div>
                <BackToTopButton />
            </div>


        </>

    )


}

export default SearchMovies;








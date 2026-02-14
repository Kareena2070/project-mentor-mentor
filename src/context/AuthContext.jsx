import { useContext, useEffect, useState } from "react";
import { createContext } from "react";


const authContext = createContext();

export const AuthProvider = ({children}) =>{

    const [user, setUser] = useState(null);

    const register = (name, email, password) =>{
        const  userData = localStorage.getItem("mentee-mentor-user")

        if(userData){
            alert("User already exists, login now")
        }

        if(!userData){
            const newUser = {
                name, email, role : "customer"
            }

            localStorage.setItem("mentee-mentor-user", JSON.stringify(newUser))
            setUser(newUser)
        }
    }

    const login = (email, password )=>{
        const userData = localStorage.getItem("mentee-mentor-user")

        if(!userData){
            alert("User not found it");
            return;
        }

        const objectData = JSON.parse(userData)

        if(objectData.email !== email){
            alert("Invalid email")
            return
        }

        setUser(objectData)
    }

    useEffect(()=>{
        const userData = localStorage.getItem("mentee-mentor-user")
        if(userData){
            setUser(JSON.parse(userData))
        }
    },[])

    const logout = ()=>{
        setUser(null);
        localStorage.removeItem("mentee-mentor-user")
    }

    return(
        <authContext.Provider value={{user, login, register, logout}}>
            {children}
        </authContext.Provider>
    );

}

export const useAuth = ()=>{
    const context = useContext(authContext);
    if(!context){
        throw new Error("AuthProvider is not wraps on main")
    }
    return context
}


import React from 'react'
import {Svg, LoadingSvg} from '../assets/Svg'
import { useState } from 'react';
import axios from "axios";
function QnAContainer() {
    const [ques, setQues] = useState("")
    const [quesAns, setQuesAns] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const handleChange = (e) => {
        if(!isLoading){
            setQues(e.target.value);
        }
    }
    const findAns = async() => {
        setIsLoading(true);
        try{
            let response = await axios.post("http://localhost:8000/ques", {data: ques});
            
            if (response.status === 200) {
                setIsLoading(false);
                setQuesAns([{ques: ques, ans: response.data.text},...quesAns])
                setQues("");
                setError("")
            }
            else{
                setIsLoading(false);
                setError("");
            }
        }
        catch(error){
            setIsLoading(false);
            console.log(error);
            if(error.response){
                setError(error.response.data)
            }
            else{
                setError(error.message)
            }
        }
    }

    return (
        <div className = "bg-white h-screen flex flex-col items-center ">
            <div className = "fixed top-0 bg-white h-32 w-screen flex items-center justify-center p-3">
                <div className = " bg-white flex justify-center rounded-md shadow-[0px_0px_7px_0px_gray] items-center overflow-hidden focus:outline-none px-2 py-3 w-[800px] h-14 ">
                    <textarea         
                    onChange = {handleChange}
                    type = "text" 
                    value = {ques}
                    placeholder = "Enter a question" 
                    rows = "1" 
                    className = "w-full resize-none focus:outline-0 bg-white" 
                    />
                    <div>
                        {!isLoading ? <Svg findAns = {findAns} /> : <LoadingSvg />}
                    </div>
                    
                </div>
                <p className = "absolute bottom-[5px] text-red-500"> {error} </p>
            </div>

            {quesAns.length !== 0 ? 
            <div className = "w-screen mt-[125px]">
                {quesAns.map((e, i) => {
                    return (<div key = {i + "qna"}>
                        <div className = "w-screen bg-slate-200 p-6" >
                            <div className = "max-w-[800px] m-auto">
                                <p className = "font-semibold" >Question:</p>
                                <p>
                                    {e.ques} 
                                </p>
                            </div>
                        </div>
                        <div className = "w-screen bg-white p-6" >
                            <div className = "max-w-[800px] m-auto">
                                <p className = "font-semibold" >Answer:</p>
                                <p>
                                    {e.ans} 
                                </p>
                            </div>
                        </div>
                    </div>)
                })}
            </div>:
            <div className = "w-screen h-screen flex justify-center items-center">
                <div className = "bg-gray-100 text-center font-semibold m-2 text-md shadow-xl rounded-md p-5">
                    <p>Ask questions based on</p>
                    <p></p>
                    <p>Service now video</p>
                </div>
            </div>}
        </div>
    )
}


export default QnAContainer

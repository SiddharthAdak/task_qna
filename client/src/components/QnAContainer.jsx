// import React from 'react'
import { Svg, LoadingSvg, DocSvg } from "../assets/Svg";
import { useState, useEffect } from "react";
import axios from "axios";
import ToasterUi from "toaster-ui";

function QnAContainer() {
  const [ques, setQues] = useState("");
  const [quesAns, setQuesAns] = useState([]);
  const [file, setFile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [error, setError] = useState("");
  const toaster = new ToasterUi();
  const base_url = import.meta.env.VITE_BASE_URL;
//   console.log(base_url);
  const toasterOptions = {
    duration: 3000,
    styles: {
      color: "white",
      "background-color": "#1f2a38",
      "font-weight": "bold",
    },
  };
  const errorToasterOptions = {
    duration: 3000,
    styles: {
      color: "#ee4344",
      "background-color": "#1f2a38",
      "font-weight": "bold",
    },
  };
  useEffect(() => {
    const findUserData = async () => {
      let response = await axios.get(`${base_url}/getdata`, {
        withCredentials: true,
      });
      console.log(response);
      if (response.data !== "no data") {
        setFile({
          vector_dir_name: response.data.vector_dir_name,
          name: response.data.file_name,
        });
        setIsProcessed(true);
      }
    };
    findUserData();
  }, []);
  const handleChange = (e) => {
    if(!isProcessed){
        setError("Please upload and process a document");
        return;
    }
    if (!isLoading) {
      setQues(e.target.value);
      setError("");
    }
  };
  const processFile = async () => {
    setIsLoading("processing");
    try {
      let formData = new FormData();
      formData.append("file", file);
      formData.append("file_name", file.name);
      // formData.append("file", file);
      let response = await axios.post(
        `${base_url}/processdoc`,
        formData,
        { withCredentials: true }
      );
      console.log(response);
      setFile({
        vector_dir_name: response.data.vector_dir_name,
        name: response.data.file_name,
      });
      setIsProcessed(true);
      setIsLoading(false);
      toaster.addToast("File Processed", "default", toasterOptions);
      // const voyClient = new VoyClient();

      // let embeddings = new HuggingFaceTransformersEmbeddings({
      //     modelName: "Xenova/all-MiniLM-L6-v2",
      // });

      // const store = new VoyVectorStore(voyClient, embeddings);
      // let docs = response.data;
      // store.addDocuments(docs);
      // setStore(store);
    } 
    catch (e) {
        toaster.addToast("Some error occured", "default", errorToasterOptions);
        console.log(e);
        setIsLoading(false);
    }
  };
  const removeFile = async () => {
    setIsLoading("deleting");
    if (isProcessed) {
      // console.log();
      try {
        await axios.delete(`${base_url}/${file.vector_dir_name}`, {
          withCredentials: true,
        });
        setFile("");
        document.getElementById("file").value = "";
        setIsProcessed(false);
        setIsLoading(false);
        toaster.addToast("File Removed", "default", toasterOptions);
      } catch (error) {
        setIsLoading(false);
        toaster.addToast("Some error occured", "default", errorToasterOptions);
        console.log(error);
      }
    } else {
      setFile("");
      document.getElementById("file").value = "";
      setIsLoading(false);
    }
  };
  const findAns = async () => {
    if(!isProcessed){
        setError("Please upload and process a document");
        return;
    }
    setIsLoading("finding");
    try {
      let response = await axios.post(`${base_url}/ques`, {
        ques: ques,
        id: file.vector_dir_name,
      });

      if (response.status === 200) {
        setIsLoading(false);
        console.log(response);
        setQuesAns([{ ques: ques, ans: response.data }, ...quesAns]);
        setQues("");
        setError("");
      } else {
        setIsLoading(false);
        setError("");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      if (error.response) {
        setError(error.response.data);
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div className="flex w-screen">
      <div className=" bg-gray-800">
        <div className="w-[300px] p-3 sticky top-6">
          <p className="mb-3 font-semibold text-white">
            Upload a PDF and click on &apos;Process&apos;
          </p>
          <input
            type="file"
            id="file"
            className="hidden"
            accept="application/pdf"
            onChange={(e) => {
              let newFile = e.target.files[0];
              let fileSize = newFile.size;
              let fileSizeInMB = fileSize / (1024 * 1024);
              console.log(fileSizeInMB)
              if(fileSizeInMB > 10){
                toaster.addToast("File limit is 10 MB", "default", errorToasterOptions);
                document.getElementById("file").value = "";
                return;
              }
              console.log(newFile);
              setFile(newFile);
            }}
          />
          {!file ? (
            <>
                <label
                htmlFor="file"
                className=" mt-5 block px-3 py-2 text-white rounded-md bg-indigo-500 w-max cursor-pointer"
                >
                Upload file
                </label>
                <div className=" mt-2 text-red-500 text-[13px]">*File limit is 10 MB</div>
            </>
          ) : (
            <div>
              <div className=" flex mt-6 mb-5 items-center">
                <div className="mr-2">
                  <DocSvg />
                </div>
                <div className="truncate text-sm text-white">{file.name}</div>
              </div>
              <div className="flex gap-3">
                {!isProcessed && (
                  <button
                    className=" block px-3 py-2 text-white rounded-md bg-indigo-500 w-max cursor-pointer"
                    onClick={() => {
                      processFile();
                    }}
                  >
                    {isLoading != "processing" ? "Process" : <LoadingSvg />}
                  </button>
                )}
                <button
                  className=" block px-3 py-2 text-indigo-500 rounded-md bg-white font-semibold w-max cursor-pointer"
                  onClick={() => {
                    removeFile();
                  }}
                >
                  {isLoading != "deleting" ? "Remove File" : <LoadingSvg />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white flex flex-col items-center flex-1">
        <div className="sticky top-0 backdrop-blur-sm h-32 w-full flex items-center justify-center p-3 px-5">
          <div className=" bg-white flex justify-center rounded-md shadow-[0px_0px_7px_0px_gray] items-center overflow-hidden focus:outline-none px-3 py-3 h-14 w-full max-w-[800px]">
            <textarea
              onChange={handleChange}
              type="text"
              value={ques}
              placeholder="Enter a question"
              rows="1"
              className="w-full resize-none focus:outline-0 bg-white"
            />
            <div>
              {isLoading !== "finding" ? (
                <Svg findAns={findAns} />
              ) : (
                <LoadingSvg />
              )}
            </div>
          </div>
          <p className="absolute bottom-[5px] text-red-500"> {error} </p>
        </div>

        {quesAns.length !== 0 ? (
          <div className=" w-full min-h-[calc(100vh-128px)]">
            {quesAns.map((e, i) => {
              return (
                <div key={i + "qna"}>
                  <div className=" bg-slate-200 p-6">
                    <div className="max-w-[800px] m-auto">
                      <p className="font-semibold">Question:</p>
                      <p>{e.ques}</p>
                    </div>
                  </div>
                  <div className="w-full bg-white p-6">
                    <div className="max-w-[800px] m-auto">
                      <p className="font-semibold">Answer:</p>
                      {
                        e.ans.split("\n").map((e, i) => {
                          return (<p key = {i}>{e}</p>)
                        })
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-[calc(100vh-128px)] flex justify-center items-center">
            <div className="bg-gray-100 text-center font-semibold m-2 text-md shadow-xl rounded-md p-5">
              <p>Ask questions based on</p>
              <p></p>
              <p>your uploaded document</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QnAContainer;

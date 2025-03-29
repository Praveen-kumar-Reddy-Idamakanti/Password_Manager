const API_URL = "http://localhost:5000/api/credentials";

export const getStoredCredentials = async (token: string) => {
  const response = await fetch(API_URL, {
    headers: { 
      "Content-Type":"application/json",
      Authorization: token },
  });
  if (!response.ok){
    const errorData = await response.json();
    if (errorData.message === "Invalid token") {
      console.error("Session expired. Logging out...");
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login page
    }
  }
  return response.json();
};

export const addCredential = async (credential:any, token:string) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify(credential),
    credentials:"include"
  });
  return response.json();
};

export const updateCredential = async (credential:any, token:string) => {
  if (!credential?._id) {
    console.error("Invalid credential ID:", credential);
    return;
  }
  await fetch(`${API_URL}/${credential._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify(credential),
    credentials:"include"
  });
};

export const deleteCredential = async (_id:string, token:string) => {
  console.log("i am in deleteCredential frontend");
  console.log(`token ${token}`);
  console.log(`_id ${_id}`);

  await fetch(`${API_URL}/${_id}`, {
    method: "DELETE",
    headers: { 
      "Authorization": `Bearer ${token}`, // Ensure "Bearer " is included
      "Content-Type": "application/json",
    },
    credentials:"include"
  });
};

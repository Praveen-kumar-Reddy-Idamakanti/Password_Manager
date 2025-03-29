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
  await fetch(`${API_URL}/${credential.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify(credential),
  });
};

export const deleteCredential = async (id:string, token:string) => {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
};

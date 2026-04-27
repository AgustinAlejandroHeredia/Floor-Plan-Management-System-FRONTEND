// FOR FRONTEND AND BACKEND

1 npm install

2 Create Auth0 SPA aplication on Applications/Applications, setting "Allowed Callback URLs" your frontend base url and frontend url with slash, same thing for "Allowed Logout URLs" and "Allowed Web Origins"

3 Create Auth0 API on Application/APIs and grant acces to the SPA aplication on this API / "Aplication access". Your SPA aplication must appear as "AUTHORIZED"

4 Once SPA aplication an API is created, use the information provided to complete the .env as the .env.example specifies

// FOR FRONTEND

5 Use your backend base url to complete the .env

// RUN PROJECT

6 Run the project with "npm run" or "npm run dev", last is recommended
import React, { ChangeEvent, useReducer, useState } from "react";
import { TextField, Button, Stack, Box, Snackbar, Alert, Typography } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import axios from 'axios'

enum field {
  USERNAME,
  PASSWORD
}

interface LoginErrorState {
  username: ErrorState;
  password: ErrorState;
}

interface ErrorState {
  inError: boolean;
  helpText: string;
}

interface LoginErrorAction {
  type: lReducerTypes;
  payload: ErrorState;
}

enum lReducerTypes {
  USERNAME,
  PASSWORD,
}

export default function LoginPage({ menuType }: {menuType: string} = {menuType: "Login"}) {
  const submitLogin = async () => {
    toggleSubmission(true)
    // Go's defer concept would be dope.
    if (!validateFields()) {
      toggleSubmission(false)
      return
    }

    await Promise.resolve(new Promise(resolve => setTimeout(resolve, 500)))
    let axiosOptions = {
      url: "/login",
      method: "post",
      withCredentials: true,
      auth: userLoginDetails,
    }

    try {
      // @ts-ignore -- Apparently method: is not a valid part of the object. I should post an issue on GH
      let res = await axios.request(axiosOptions)
      console.log(res)
    } catch (e) {
      toggleOpen(true)
    } finally {
      toggleSubmission(false)
    }

  }

  const loginErrorReducer = (state: LoginErrorState, action: LoginErrorAction) => {
    const {type, payload} = action
    switch (type) {
      case lReducerTypes.USERNAME:
        if (state.username.inError == payload.inError) return state;
        return {...state, username: payload};
      case lReducerTypes.PASSWORD:
        if (state.password.inError == payload.inError) return state;
        return {...state, password: payload};
    }
  }
  const validateFields = (): boolean => {
    let isValid = true;
    let username = { inError: false, helpText: "" }
    let password = { inError: false, helpText: "" }

    if (userLoginDetails.username.trim() === "") {
      username = {inError: true, helpText: "Please enter a valid username"}
      isValid = false
    }

    if (userLoginDetails.password.trim() === "") {
      password = {inError: true, helpText: "Please enter a valid password"}
      isValid = false
    }

    // @ts-ignore
    dispatchUserLoginErrors({type: lReducerTypes.USERNAME, payload: username})
    // @ts-ignore
    dispatchUserLoginErrors({type: lReducerTypes.PASSWORD, payload: password})
    return isValid;
  }

  const updateInputField = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, textType: field) => {
    let username = textType == field.USERNAME ? event.target.value : userLoginDetails.username
    let password = textType == field.PASSWORD ? event.target.value : userLoginDetails.password
    updateUserLoginDetails({username: username, password: password})
  }

  const [submittingLogin, toggleSubmission] = useState(false);
  const [open, toggleOpen] = useState(false)
  const [userLoginDetails, updateUserLoginDetails] = useState({username: "", password: ""})

  const [userLoginErrors, dispatchUserLoginErrors] = useReducer(loginErrorReducer, {
    username: { inError: false, helpText: "" },
    password: { inError: false, helpText: "" }
  })
  const vertical = 'bottom';
  const horizontal = 'right'
  return (
    <header className="App-header">
      <Typography>
        Login
      </Typography>
      <Box sx={{height: 10}}/>

      <Stack spacing={2}>

        <TextField id="input-username"
                   label="Username"
                   variant="outlined"
                   disabled={submittingLogin}
                   onChange={(event) => updateInputField(event, field.USERNAME)}
                   helperText={userLoginErrors.username.helpText}
                   error={userLoginErrors.username.inError}
        />

        <TextField id="input-password"
                   label="Password"
                   variant="outlined"
                   type="password"
                   disabled={submittingLogin}
                   onChange={(event) => updateInputField(event, field.PASSWORD)}
                   helperText={userLoginErrors.password.helpText}
                   error={userLoginErrors.password.inError}
        />

        <LoadingButton loading={submittingLogin} onClick={submitLogin} variant="outlined">
          Login
        </LoadingButton>
      </Stack>

      <Snackbar open={open}
                autoHideDuration={6000}
                onClose={() => toggleOpen(false)}
                anchorOrigin={{ vertical, horizontal }}
      >
        <Alert onClose={() => toggleOpen(false)} severity="error" sx={{ width: '100%' }}>
          Incorrect login details. Please try again.
        </Alert>
      </Snackbar>

    </header>
  );
}

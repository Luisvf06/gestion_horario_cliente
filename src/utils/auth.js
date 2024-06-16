// src/utils/auth.js

console.log('Base URL:', import.meta.env.PUBLIC_URL);

export function getAuthenticatedUser() {
  const token = sessionStorage.getItem('authToken');
  if (!token) {
    return null;
  }

  const apiUrl = `${import.meta.env.PUBLIC_URL}/api/user`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return fetch(apiUrl, { headers })
    .then(response => response.json())
    .then(user => user)
    .catch(err => null);
}

export async function loginUser(userName, password) {
  try {
    const response = await fetch(`${import.meta.env.PUBLIC_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_name: userName,
        password: password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la respuesta del servidor: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    throw error;
  }
}

export async function sendResetPasswordLink(email) {
  try {
    const response = await fetch(`${import.meta.env.PUBLIC_URL}/api/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la respuesta del servidor: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al enviar el enlace de restablecimiento de contraseña:', error.message);
    throw error;
  }
}

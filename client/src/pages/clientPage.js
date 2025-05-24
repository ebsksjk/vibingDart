// client/src/pages/ClientPage.js
import React from 'react';
import DartCounterClient from '../vibedartClient.js';

function ClientPage() {
  return (
    <>
      <h1>Spielereingabe:</h1>
      <DartCounterClient />
    </>
  );
}

export default ClientPage;
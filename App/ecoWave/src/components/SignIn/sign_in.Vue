<script></script>
<template>
    <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
    </head>
    <body>
        <header>
            <h1>EcoWave</h1>
        </header>
        <main>
            <div class="left-block">
                <h2>De retour ?</h2>
                <p>Vous possédez déjà un compte ? <br>Connectez-vous !</p>
                <input type="submit" value="Se connecter">
            </div>
            <div class="create-account">
                <h2>Créer un compte</h2>
                <p>Se connecter avec les réseaux</p>
                <div class="social-media-connection">
                    <a href="https://google.com"><img src="../../assets/logo/google.png" alt=""></a>
                    <a href="https://facebook.com"><img src="../../assets/logo/facebook.png" alt=""></a>
                </div>
                <div class="social-input-separation">
                    <hr>
                    <p>or</p>
                    <hr>
                </div>
            </div>
        </main>
    </body>
</template>
<style>
    header{
        width: 100%;
        height: 170px;
        background-color: #3da92c;
    }
    header h1{
        text-align: center;
        font-family: "Inter";
    }
</style>
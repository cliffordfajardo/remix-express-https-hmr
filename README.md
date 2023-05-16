# Test Repo: Remix using Express with HTTPS - HMR attempt

## 1. Install dependencies

```sh
npm i
```

## 2. Generate self-signed certs
Since we intend on using HTTPs, we need to create self-signed certificates.
After running the command below, you will be prompted to give answers to the openssl CLI tool that generates the cert `server.key` and `server.cert` file.


```sh
npm run gen-cert

# For details see this small blog post:  https://flaviocopes.com/express-https-self-signed-certificate/
```

## 3. Start the remix app
```sh
## NOTE: you will be prompted t
npm run dev
```
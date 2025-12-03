This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn`

This will install all the dependencies you need to run the application once.

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

**Tests are not in scope for this project.**

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**
**Do not try this**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

**Do not try this**

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

---

### Fixed Console Warnings/Errors

**1. div cannot appear as a descendant of p**

In component : ProjectCards.jsx

Before

```
return (
    <Card className={classes.root} variant="outlined">
      <CardActionArea>
        <Typography noWrap> // Default to a Div

```

After

```
return (
    <Card className={classes.root} variant="outlined">
      <CardActionArea>
        <Typography noWrap component="span"> // Renders a span

```

### Known Errors

**1. findDOMNode is deprecated in StrictMode. findDOMNode was passed an instance of Transition which is inside StrictMode.**

    Further Reading available here

    https://github.com/mui-org/material-ui/issues/20561
    https://github.com/mui-org/material-ui/issues/13394

**2.**

---

### Useful Links

1. React Hooks Forms + Material UI
   https://codesandbox.io/s/react-hook-form-hookforminput-rzu9s

2. Prevent Route Transition when filling the form
   https://reactrouter.com/web/example/preventing-transitions

3. Flow
   https://medium.com/better-programming/building-basic-react-authentication-e20a574d5e71

# Do not diable anything for system.role==3 (Admin)

​

## Jobs waiting in queue table

​
| Button | Status |
| :------------- | :------------- |
| Cancel | disable if project.role <=1 |
​
​
​

## Processed Jobs

​
| Button | Status |
| :------------- | :------------- |
| View analysis report | disable if (jobs.status != 3) |
| View study summary | enable for all |
| Reload job | disable if (jobs.status != 3 OR jobs.status != 4 OR project.role <=1 ) |
| Add variables(addons) | disable if (jobs.status != 3 OR project.role <=1 ) |
| Download data | disable if (jobs.status != 3 OR project.role <=1 ) |
| Download analysis report | disable if (jobs.status != 3 OR project.role <=1 ) |
| View addons | disable if study does not have an addon |
| Delete study | disable if (jobs.userid != currentUser.id OR project.role <=1 ) |
| Request full DB extract | disable if (jobs.status != 3 AND project.role <=1 ) |
​
​

## Addons waiting in queue table

​
| Button | Status |
| :------------- | :------------- |
| Cancel | disable if (project.role <=1) |
​
​

## Processed Addons

​
| Button | Status |
| :------------- | :------------- |
| View study summary | enable for all |
| Reload Addon | disable if (addons.status != 3 OR addons.status != 4 OR project.role <=1 ) |
| Download data | disable if (addons.status != 3 OR project.role <=1 ) |
| Delete addon | disable if (jobs.userid != currentUser.id OR project.role <=1 ) |

# Setup

## Download Redis

-   Navigate to the URL: https://github.com/microsoftarchive/redis/releases/tag/win-3.2.100

-   Download the MSI, Install redis on the machine which has code and db.

-   Installation is pretty simple - Next Next and done.

## Database Preparation

### Insert Newly created tables.

```

CREATE TABLE public.newusers
(
    userid character varying(100) COLLATE pg_catalog."default" NOT NULL,
    password character varying(100) COLLATE pg_catalog."default",
    fullname character varying(100) COLLATE pg_catalog."default",
    status smallint,
    registrationdt timestamp without time zone,
    CONSTRAINT newusers_pkey PRIMARY KEY (userid)
)

TABLESPACE pg_default;

ALTER TABLE public.newusers
    OWNER to postgres;



--

CREATE SEQUENCE public.messages_messageid_seq
    INCREMENT 1
    START 32
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.messages_messageid_seq
    OWNER TO postgres;


CREATE TABLE public.messages
(
    messageid integer NOT NULL DEFAULT nextval('messages_messageid_seq'::regclass),
    summary text COLLATE pg_catalog."default",
    details text COLLATE pg_catalog."default",
    severity smallint NOT NULL,
    createdby character varying(100) COLLATE pg_catalog."default",
    createdon timestamp without time zone NOT NULL,
    status smallint NOT NULL,
    CONSTRAINT messages_pkey PRIMARY KEY (messageid),
    CONSTRAINT messages_createdby_fkey FOREIGN KEY (createdby)
        REFERENCES public.users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE public.messages
    OWNER to postgres;

--


```

### Update foreign key

```
Table: otps.
Action:

Point otps_userid_fkey1 foreign key to newusers table userid column instead of users table.

```

## Download Code

1. Java Spring boot code - This will run on port 8433 as HTTPS with TLS1.2 support.
   Changes to port and other configurations can be done in application.properties file.

2. React UI Code - Will run on port 3000 on HTTPS.
   Changes to port and other configurations can be done in .env file.

## data folder

1. Create a folder in the path: `c:\dex`

2. Create a file with the name(case sensitive) `ApplicationData.properties`

3. Sample file contents

```
IMRD=619931000006119
CEGEDIM_COVID_2020=200,300
AURUM_COVID_2020=200,300
CPRD_GOLD=500,501

```

## Prepare Certificates

1. First copy the required certificates (i'm assuming you have .pem cert & key files) to frontend `./cert` folder - Make sure the certificate is installed @ Trusted root store.
   Note: The below step is only needed, if you want to try another self signed certificate and not the actual certificate for some reason.
   If you want to try with some dummy certificates to start with, checkout mkcert website and install it for your os. Post Install, run the below command.

`mkcert -cert-file ./newcert.pem -key-file ./newcertkey.pem localhost 127.0.0.1 ::1`

1. Install the certificate in the Trusted Root Folder.

2. Open Gitbash and goto ./cert folder and run the below command. This is to generate a P12 certificate from the input .pem certificate.

3. goto drivers/etc folder. Open hosts file via notepad (as admin) and enable localhost 127.0.0.1

```

openssl pkcs12 -export -out apicert.p12 -in cert.pem -inkey key.pem -passin pass:321 -passout pass:321

```

cert.pem and key.pem are your input certificates.

apicert.p12 --> Output certificate name for java, it should be placed in the java keystore folder (springboot-api\src\main\resources\keystore)

`-passout pass:321` --> 321 is what you need to configure in the java springboot application properties file. The password is currently not encrypted.

1. Install the API certificate in the Trusted Root Folder.

## Build Java Code

#### Option 1

In case you have downloaded the code and not using the jar, You need to first compile the code. Run the below command from there folder where you see `pom.xml` file

NOTE : Dspring.profiles.active=april -- Will run configuration as per `application-april.properties` file.

```
  mvn clean install -Dmaven.test.skip=true && cd target && java -DdisableTransaction=True -Dspring.profiles.active=april -jar dexter-1.0.jar

```

#### Option 2

If you have the jar, run the below command in the folder where the jar file is placed.

```

java -DdisableTransaction=True -Dspring.profiles.active=april -jar dexter-1.0.jar

```

Note: In both the cases, we are assuming the name of the jar is `dexter-1.0.jar`. If you have a different name, replace `dexter-1.0.jar` appropriately.

## Build React Code

Navigate to the folder which has package.json file related to the React code.. Run the below command

```
yarn install
yarn build
```

or in case you have npm, replace yarn with npm

```
npm install
npm build
```

## Run application via UI.

https://localhost:3000

Login with your ID and Password.
You can also register yourself with a dummy email id via the registration link.

Note: Actual Email are not enabled yet. So, Email URLs can be found in the java terminal where you run the `.jar` file.

## Run api via postman

This can be done as well by configuring the certificate in postman. You can test the list of API below (List is WIP). Do ensure you provide a valid bearer token and userid via request header. Will Demo you how to do this if it helps.

## August 08th Update

---

```

-- Table: public.refreshtoken
-- DROP TABLE public.refreshtoken;
CREATE TABLE public.refreshtoken
(
    userid character varying(255) COLLATE pg_catalog."default" NOT NULL,
    expiry_date timestamp without time zone NOT NULL,
    token character varying(255) COLLATE pg_catalog."default" NOT NULL,
    user_id character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT refreshtoken_pkey PRIMARY KEY (userid),
    CONSTRAINT uk_or156wbneyk8noo4jstv55ii3 UNIQUE (token),
    CONSTRAINT fka652xrdji49m4isx38pp4p80p FOREIGN KEY (user_id)
        REFERENCES public.users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;
ALTER TABLE public.refreshtoken
    OWNER to postgres;

```

---

## August 30th Update

Add the below two keys into the system env. variable.

%APP_KEY%
%JWT_KEY%

The values for the above two keys are already shared.

Next, add these two 'keys' into system env. "path" variable.

## Instructions for enabling eslint on save

We recommend using Visual Studio Code as the IDE

1.  Open Visual studio Code, Bring up the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of VS Code or the View: Extensions command (Ctrl+Shift+X).
2.  Search for ESLint from microsoft and prettier from prettier.io (You can also search with identfier: dbaeumer.vscode-eslint and esbenp.prettier-vscode).
3.  Install the extensions and then open the Settings editor, navigate to File > Preferences > Settings.
4.  From the top right corner, open settings (JSON) and add following lines
    "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
    },
    "eslint.validate": ["javascript"],
    "editor.defaultFormatter": "esbenp.prettier-vscode",

## Instructions for duplicate files for under /Services folder

While formatting or lint checking if you encounter an issue where you see same file under /services and /Services folder and you are having trouble staging/reverting such files then do the following:

1. git config --local core.ignorecase false (PS: keep the flag as local only)
2. Now do git add <file> or git add .

## Some first time steps:

### Enable Hooks.

Open gitbash & Navigate to the project root directory and run the below commands.

`chmod +x setup_hooks.sh`

and then

`./setup_hooks.sh`

Now, your git hooks are set up and ready.

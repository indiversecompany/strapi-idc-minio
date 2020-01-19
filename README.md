#  strapi-idc-minio 

Custom upload plugin for use with Strapi API server. 

Build to address the problem that existing upload code / plugins 
populate API responses with the same endpoint as the internal minio or s3 bucket file is 
uploaded to. 

For IDC we need the external URL to not be either (as would be natively)
 - s3.bucker.aws...../file.png
 - idc_minio:9000/file.png  
 
 We require the API to reply with either:
 - https://absolute.com/some-path/file.png
 - /some-path/file.png 
 
 ##  About
 Edit `lib/index.js` for either of these to be uncommented.   
 This will overwrite the API URI written to the DB, and then sent to user
 
 ```
// file.url = `${config.baseUrl}/${filename}`; // absolute
file.url = `/${filename}` // relative
```

## Install 

After creating a strap project. ie. `strapi new myproject`

```
cd myproject
npm install https://github.com/indiversecompany/strapi-idc-minio.git --save
```

## To use:
In Strapi head to `Plugins/Configurations`  
Select `strapi-idc-minio` from the drop down. 

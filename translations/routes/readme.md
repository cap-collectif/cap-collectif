# Route translation

Route translations are generated thanks to the library jmsI18nRouting
coupled with JmsTranslationBundle.

Routes are committed to prevent CI from having to launch the command mention
 in the section "*Add a route*".

## Add a route

To add a route, launch the following command:
```
bin/console translation:extract --config=app
```

The corresponding config file is present in "jms_translation.yaml"
By default, we choose to keep the routes already translated but you can change this
behavior by simply changing the "keep" option in the previously mentioned file.

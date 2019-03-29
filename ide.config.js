/* Used as a workaround to make autocompletion path working with
import {xxx} from '~relay/xxx.graphql' in IntelliJ based IDEs.
See https://youtrack.jetbrains.com/issue/WEB-22717#focus=streamItem-27-1558931.0-0
because it does not actually support jsconfig.json
*/
/* eslint-disable */
System.config({
  "paths": {
    "~relay/*": "./app/Resources/js/__generated__/~relay/*"
  }
});

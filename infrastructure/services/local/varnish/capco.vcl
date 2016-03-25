vcl 4.0;
import std;

backend default {
  .host = "localhost";
  .port = "8080";
}

# ACL we'll use later to allow purges
acl purge {
  "localhost";
  "127.0.0.1";
  "::1";
}

# Called at the beginning of a request, after the complete request has been received and parsed.
sub vcl_recv {

  # Ensure that the Symfony Router generates URLs correctly with Varnish
  if (req.http.X-Forwarded-Proto == "https" ) {
    set req.http.X-Forwarded-Port = "443";
  } else {
    set req.http.X-Forwarded-Port = "80";
  }

  # Allow purging
  if (req.method == "PURGE") {
    if (!client.ip ~ purge) { # purge is the ACL defined at the begining
      # Not from an allowed IP? Then die with an error.
      return (synth(405, "This IP is not allowed to send PURGE requests."));
    }
    # If you got this stage (and didn't error out above), purge the cached result
    return (purge);
  }

  # DEV only
  if (req.method == "BAN") {
    ban("req.http.host == " + req.http.host);
    return(synth(200, "Ban added"));
  }

  if (req.url ~ "\.(jpeg|jpg|png|gif|ico|webp|js|css)$") {
    return (pass); # disable static files cache in dev
  }

  if (req.http.host ~ "capco.dev" ) {
    return(pass);
  }
  ## End DEV only

  # Only cache GET or HEAD requests. This makes sure the POST requests are always passed.
  if (req.method != "GET" && req.method != "HEAD") {
    return (pass);
  }

  # Remove all cookies except the session ID.
  if (req.http.Cookie) {
    set req.http.Cookie = ";" + req.http.Cookie;
    set req.http.Cookie = regsuball(req.http.Cookie, "; +", ";");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(PHPSESSID)=", "; \1=");
    set req.http.Cookie = regsuball(req.http.Cookie, ";[^ ][^;]*", "");
    set req.http.Cookie = regsuball(req.http.Cookie, "^[; ]+|[; ]+$", "");

    if (req.http.Cookie == "") {
      # If there are no more cookies, remove the header to get page cached.
      unset req.http.Cookie;
    }
  }

  return (hash);
}

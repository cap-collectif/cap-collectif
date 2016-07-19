vcl 4.0;
import std;

backend default {
  .host = "localhost";
  .port = "8080";
}

# Called at the beginning of a request, after the complete request has been received and parsed.
sub vcl_recv {

  # https://httpoxy.org/#fix-now
  unset req.http.proxy;

  # Delete cookie for static files
  if (req.url ~ "\.(jpeg|jpg|png|gif|ico|webp|js|css|woff|ott)$") {
    unset req.http.Cookie;
  }

  # Ensure that the Symfony Router generates URLs correctly with Varnish
  if (req.http.X-Forwarded-Proto == "https" ) {
    set req.http.X-Forwarded-Port = "443";
  } else {
    set req.http.X-Forwarded-Port = "80";
  }

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
}

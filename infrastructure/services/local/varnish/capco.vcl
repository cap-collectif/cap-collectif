vcl 4.0;
import std;

backend default {
  .host = "localhost";
  .port = "8080";
}

sub vcl_recv {
  # Called at the beginning of a request, after the complete request has been received and parsed.

  if (req.http.Cookie) {
    set req.http.Cookie = ";" + req.http.Cookie;
    set req.http.Cookie = regsuball(req.http.Cookie, "; +", ";");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(PHPSESSID)=", "; \1=");
    set req.http.Cookie = regsuball(req.http.Cookie, ";[^ ][^;]*", "");
    set req.http.Cookie = regsuball(req.http.Cookie, "^[; ]+|[; ]+$", "");

    if (req.http.Cookie == "") {
      unset req.http.Cookie;
    }
  }
}

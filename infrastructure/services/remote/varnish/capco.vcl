vcl 4.0;
import std;

backend default {
  .host = "localhost";
  .port = "8080";
}

sub vcl_recv {
  # Called at the beginning of a request, after the complete request has been received and parsed.

  if (req.url ~ "(?i)\.(jpeg|jpg|png|gif|ico|webp|js|css|txt|pdf|gz|zip|lzma|bz2|tgz|tbz|html|htm)$") {
    unset req.http.Cookie;
    return (lookup);
  }

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

sub vcl_fetch {

  if (req.url ~ "(?i)\.(jpeg|jpg|png|gif|ico|webp|js|css|txt|pdf|gz|zip|lzma|bz2|tgz|tbz|html|htm)$") {
      unset beresp.http.set-cookie;
  }
}

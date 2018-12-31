vcl 4.0;
import std;

backend default {
  .host = "localhost";
  .port = "8080";
  .connect_timeout = 15s;
  .between_bytes_timeout = 15s;
}

acl invalidators {
    "localhost";
}

# https://feryn.eu/blog/varnishlog-measure-varnish-cache-performance/


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

  # Allow to invalidate cache
  if (req.method == "PURGE") {
      if (!client.ip ~ invalidators) {
          return (synth(405, "Not allowed"));
      }
      return (purge);
  }

  # Allow to disable cache if allowed
  if (req.http.Cache-Control ~ "no-cache" && client.ip ~ invalidators) {
    set req.hash_always_miss = true;
  }

  if (req.method == "BAN") {
      if (!client.ip ~ invalidators) {
          return (synth(405, "Not allowed"));
      }
      if (req.http.X-Cache-Tags) {
            ban("obj.http.X-Host ~ " + req.http.X-Host
                + " && obj.http.X-Url ~ " + req.http.X-Url
                + " && obj.http.content-type ~ " + req.http.X-Content-Type
                + " && obj.http.X-Cache-Tags ~ " + req.http.X-Cache-Tags
            );
      }
      else {
          ban("obj.http.X-Host ~ " + req.http.X-Host
              + " && obj.http.X-Url ~ " + req.http.X-Url
              + " && obj.http.content-type ~ " + req.http.X-Content-Type
          );
      }
      return (synth(200, "Banned"));
  }

  # Only cache GET or HEAD requests. This makes sure the POST requests are always passed.
  if (req.method != "GET" && req.method != "HEAD") {
    return (pass);
    # Maybe use https://docs.varnish-software.com/tutorials/caching-post-requests/
  }

  # Remove all cookies except the Symfony or SimpleSAML session or Paris (mcpAuth) session.
  if (req.http.Cookie) {
    set req.http.Cookie = ";" + req.http.Cookie;
    set req.http.Cookie = regsuball(req.http.Cookie, "; +", ";");
    set req.http.Cookie = regsuball(req.http.Cookie, ";(PHPSESSID|SimpleSAMLAuthToken|SimpleSAMLSessionID|mcpAuth)=", "; \1=");
    set req.http.Cookie = regsuball(req.http.Cookie, ";[^ ][^;]*", "");
    set req.http.Cookie = regsuball(req.http.Cookie, "^[; ]+|[; ]+$", "");

    if (req.http.Cookie == "") {
      # If there are no more cookies, remove the header to get page cached.
      unset req.http.Cookie;
    }
  }
}

vcl 4.0;
import std;

backend default {
  .host = "localhost";
  .port = "8080";
}

# Called at the beginning of a request, after the complete request has been received and parsed.
sub vcl_recv {
  # Delete cookie for static files
  if (req.url ~ "\.(jpeg|jpg|png|gif|ico|webp|js|css)$") {
    unset req.http.Cookie;
  }

  # Ensure that the Symfony Router generates URLs correctly with Varnish
  set req.http.X-Forwarded-Port = "443";

  # Disable cache for development
  if (req.http.host == "capco.dev") {
    return (pass);
  }

  # Disable cache for testing
  if (req.http.host == "capco.test") {
    return (pass);
  }

  # Disable cache for blackfire
  if (req.http.X-Blackfire-Query) {
    return (pass);
  }

  # Allow purge
  if (req.method == "PURGE") {
      return (purge);
  }

  if (req.http.Cache-Control ~ "no-cache") {
    set req.hash_always_miss = true;
  }

  # Allow ban
  if (req.method == "BAN") {
    ban("req.http.host == " + req.http.host);
    return(synth(200, "Ban added"));
  }

  # Only cache GET or HEAD requests. This makes sure the POST requests are always passed.
  if (req.method != "GET" && req.method != "HEAD") {
    return (pass);
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

# Handle Cache-Control: no-cache and private
sub vcl_backend_response {
    if (beresp.ttl <= 0s ||
      beresp.http.Set-Cookie ||
      beresp.http.Surrogate-control ~ "no-store" ||
      (!beresp.http.Surrogate-Control &&
        beresp.http.Cache-Control ~ "no-cache|no-store|private") ||
      beresp.http.Vary == "*") {
        /*
        * Mark as "Hit-For-Pass" for the next 2 minutes
        */
        set beresp.ttl = 120s;
        set beresp.uncacheable = true;
    }
    return (deliver);
}

sub vcl_deliver {
    # Add extra headers for debugging
    if (resp.http.X-Varnish ~ " ") {
      set resp.http.X-Cache = "HIT";
    } else {
      set resp.http.X-Cache = "MISS";
    }
}

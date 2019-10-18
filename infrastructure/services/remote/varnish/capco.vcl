vcl 4.0;
import std;
import bodyaccess;
import cookie;

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

  # This is to make sure that clients can not change the caching behavior of our VCL by sending non-standard headers with the request.
  unset req.http.X-Body-Len;

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

  # Remove all cookies except the Symfony or SimpleSAML session or Paris (mcpAuth) session.
  if (req.http.Cookie) {
    cookie.parse(req.http.Cookie);
    cookie.filter_except("PHPSESSID,SimpleSAMLAuthToken,SimpleSAMLSessionID,mcpAuth");
    set req.http.cookie = cookie.get_string();

    if (req.http.Cookie == "") {
      # If there are no more cookies, remove the header to get page cached.
      unset req.http.Cookie;
    }
  }

  # Only cache POST GraphQL internal API requests.
  if (req.method == "POST" && req.url ~ "graphql/internal$") {

        # Skip cache if viewer is authenticated.
        if (req.http.Cookie) {
            # std.log("Skipping cache because viewer is authenticated.");
            return (pass);
        }

        # Will store up to 500 kilobytes of request body.
        std.cache_req_body(500KB);
        set req.http.X-Body-Len = bodyaccess.len_req_body();

        # If a client supplies a very big request (more than 500KB)
        if (req.http.X-Body-Len == "-1") {
            # Too big to cache
            # std.log("Skipping cache because body is too big.");
            return (pass);
        }

        # Always send GraphQL mutations to the backend.
        if (bodyaccess.rematch_req_body("mutation") == 1) {
            return (pass);
        }

        return (hash);
  }

  # Only cache GET or HEAD requests. 
  # This makes sure the POST requests are always passed.
  if (req.method != "GET" && req.method != "HEAD") {
    return (pass);
  }
}

# Change the hashing function to handle POST request
sub vcl_hash {
    # To cache POST requests
    if (req.http.X-Body-Len) {
        bodyaccess.hash_req_body();
    } else {
        hash_data("");
    }
}

# The default behavior of Varnish is to pass POST requests to the backend.
# When we override this in vcl_recv, Varnish will still change the request method to GET before calling sub vcl_backend_fetch.
# We need to undo this, like this:
sub vcl_backend_fetch {
    if (bereq.http.X-Body-Len) {
        set bereq.method = "POST";
    }
}

# Remove from response headers verbose things such as Varnish version.
sub vcl_deliver {
    unset resp.http.Via;
    return(deliver);
}

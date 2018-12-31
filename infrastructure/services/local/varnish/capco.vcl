vcl 4.0;
import std;
import bodyaccess;
import cookie;

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

  # This is good practice; 
  # Delete all headers that we will use internally.
  # This is to make sure that clients can not change the caching behavior of our VCL by sending non-standard headers with the request.
  unset req.http.X-Body-Len;

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

  # Only cache POST GraphQL API requests.
  if (req.method == "POST" && req.url ~ "graphql/internal$") {

        # Skip cache if viewer is authenticated.
        if (req.http.Authorization) {
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

sub vcl_deliver {
    # Add extra headers for debugging
    if (resp.http.X-Varnish ~ " ") {
      set resp.http.X-Cache = "HIT";
    } else {
      set resp.http.X-Cache = "MISS";
    }
}

vcl 4.0;
import std;
import bodyaccess;
import cookie;

backend default {
  .host = "localhost";
  .port = "8080";
  .connect_timeout = 20s;
  .between_bytes_timeout = 20s;
}

acl invalidators {
    "localhost";
}

# https://feryn.eu/blog/varnishlog-measure-varnish-cache-performance/


# Called at the beginning of a request, after the complete request has been received and parsed.
sub vcl_recv {

  # https://httpoxy.org/#fix-now
  unset req.http.proxy;

  # Only cache requests to eelv
  if (req.http.host == "projet.lesecologistes.fr") {
    # Continue to caching logic
  } else {
    return (pass);
  }


  # Normalize Accept-Language to supported locales to improve cache hit ratio.
  # Supported locales: en-GB, fr-FR, es-ES, de-DE, nl-NL, sv-SE, eu-EU, oc-OC, ur-IN
  # Without this, each unique Accept-Language header creates a separate cache entry.
  if (req.http.Accept-Language) {
    if (req.http.Accept-Language ~ "^fr" || req.http.Accept-Language ~ ",\s*fr") {
      set req.http.Accept-Language = "fr-FR";
    } else if (req.http.Accept-Language ~ "^es" || req.http.Accept-Language ~ ",\s*es") {
      set req.http.Accept-Language = "es-ES";
    } else if (req.http.Accept-Language ~ "^de" || req.http.Accept-Language ~ ",\s*de") {
      set req.http.Accept-Language = "de-DE";
    } else if (req.http.Accept-Language ~ "^nl" || req.http.Accept-Language ~ ",\s*nl") {
      set req.http.Accept-Language = "nl-NL";
    } else if (req.http.Accept-Language ~ "^sv" || req.http.Accept-Language ~ ",\s*sv") {
      set req.http.Accept-Language = "sv-SE";
    } else if (req.http.Accept-Language ~ "^eu" || req.http.Accept-Language ~ ",\s*eu") {
      set req.http.Accept-Language = "eu-EU";
    } else if (req.http.Accept-Language ~ "^oc" || req.http.Accept-Language ~ ",\s*oc") {
      set req.http.Accept-Language = "oc-OC";
    } else if (req.http.Accept-Language ~ "^ur" || req.http.Accept-Language ~ ",\s*ur") {
      set req.http.Accept-Language = "ur-IN";
    } else {
      # Default to English for any other language
      set req.http.Accept-Language = "en-GB";
    }
  } else {
    set req.http.Accept-Language = "en-GB";
  }

  # This is to make sure that clients can not change the caching behavior of our VCL by sending non-standard headers with the request.
  unset req.http.X-Body-Len;
  unset req.http.X-User-Logged-In;

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

  # Remove all cookies except the Symfony or SimpleSAML session.
  if (req.http.Cookie) {
    cookie.parse(req.http.Cookie);
    cookie.keep("PHPSESSID,SimpleSAMLAuthToken,SimpleSAMLSessionID,locale,CapcoAnonReply,CapcoParticipant");
    set req.http.cookie = cookie.get_string();

    if (req.http.Cookie == "") {
      # If there are no more cookies, remove the header to get page cached.
      unset req.http.Cookie;
    }
  }

  # Only cache POST GraphQL internal API requests.
  if (req.method == "POST" && req.url ~ "graphql/internal$") {

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

# Called after the response headers are successfully retrieved from the backend.
sub vcl_backend_response {
    # Don't cache responses for authenticated users
    # The backend sets X-User-Logged-In: 1 for authenticated users
    if (beresp.http.X-User-Logged-In == "1") {
        set beresp.uncacheable = true;
        set beresp.ttl = 0s;
        return (deliver);
    }

    # For unauthenticated users (X-User-Logged-In: 0), enable caching
    if (beresp.http.X-User-Logged-In == "0" && !(bereq.http.Cookie ~ "CapcoParticipant=")) {
        # Remove Set-Cookie header to allow caching
        unset beresp.http.Set-Cookie;

        set beresp.ttl = 1m;

        # Override backend cache control headers
        unset beresp.http.Cache-Control;
        unset beresp.http.Expires;
    }
}

# Remove from response headers verbose things such as Varnish version.
sub vcl_deliver {
    # Remove the X-User-Logged-In header before sending to client
    unset resp.http.X-User-Logged-In;

    unset resp.http.Via;
    return(deliver);
}

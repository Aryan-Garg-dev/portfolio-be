


### Improvements
Replaced "express-async-error" with my custom "asyncHandler" and integrated it with my "createController"
Created "cacheHeaders" middleware for defining optimal caching headers easily. 


### Theory for *cacheHeaders* Middleware
| Directive                          | Meaning                                                                                                                  |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `public`                           | Response can be cached by any cache (browser, CDN, reverse proxy).                                                       |
| `private`                          | Response is specific to a single user and **should not be stored by shared caches**.                                     |
| `max-age=<seconds>`                | Maximum time the response is considered fresh. After this, client must revalidate.                                       |
| `stale-while-revalidate=<seconds>` | Allows serving stale content while revalidating in the background (good for high traffic endpoints).                     |
| `immutable`                        | Indicates the response **will never change**; browser can keep it indefinitely (commonly used for hashed static assets). |
| `must-revalidate`                  | Cache must revalidate the response with the server after `max-age` expires.                                              |
| `no-cache`                         | Forces caches to **revalidate with the server** before using stored copy.                                                |
| `no-store`                         | Completely disables caching; never store the response anywhere.                                                          |

Expires: defines a date/time after which the response is considered stale.
Pragma: no-cache was introduced to tell browsers and intermediate proxies not to cache the response.
The Vary header tells caches which request headers affect the response.

| Header            | Purpose                                                               |
|-------------------|-----------------------------------------------------------------------|
| `Authorization`   | User-specific content may change depending on token.                  |
| `Cookie`          | User session/cookie affects response content.                         |
| `Accept-Encoding` | Response varies if client accepts gzip, Brotli, etc.                  |
| `Accept`          | Response may change depending on `Accept` header (e.g., JSON vs XML). |

| Behavior   | When to use                                               | Notes                                           |
|------------|-----------------------------------------------------------|-------------------------------------------------|
| `static`   | CSS, JS, images with versioning                           | `max-age=1y`, `immutable`, public               |
| `fresh`    | API responses that change often but can be cached briefly | `max-age=5min`, must-revalidate, public         |
| `stale-ok` | Articles or listings that can be stale briefly            | `max-age=10min`, `stale-while-revalidate=20min` |
| `no-cache` | Sensitive or frequently updated data                      | Forces revalidation every request               |
| `no-store` | Private dashboards, user profiles                         | No caching anywhere                             |


ETag (short for Entity Tag) is a HTTP response header used to determine whether the content of a resource has changed since the last time a client requested it. It’s a core part of conditional requests and browser/CDN caching.
- Reduces server load → server doesn’t have to send full response if unchanged.
- Saves client bandwidth → only headers are exchanged for unchanged resources.
- Works with CDNs → CDNs can validate cached content against origin.
- Improves perceived speed → client renders from cache immediately if not modified.
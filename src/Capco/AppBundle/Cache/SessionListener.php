<?php

namespace Capco\AppBundle\Cache;

use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\EventListener\SessionListener as SymfonySessionListener;

/**
 * Decorates the default Symfony session listener.
 *
 * Since Symfony 3.4, the default Symfony session listener automatically
 * overwrites the Cache-Control headers to `private` in case the session has
 * been started. This destroys the user context feature of FOSHttpCache.
 *
 * @todo:
 * When we switch Symfony 4.1, there is a header we must set in UserContextListener to skip this behaviour.
 */
class SessionListener extends SymfonySessionListener
{
    public function onKernelResponse(FilterResponseEvent $event)
    {
        if (!$event->isMasterRequest()) {
            return;
        }

        $response = $event->getResponse();
        $autoCacheControl = !$response->headers->has(self::NO_AUTO_CACHE_CONTROL_HEADER);
        // Always remove the internal header if present
        $response->headers->remove(self::NO_AUTO_CACHE_CONTROL_HEADER);

        if (
            !($session =
                $this->container && $this->container->has('initialized_session')
                    ? $this->container->get('initialized_session')
                    : $event->getRequest()->getSession())
        ) {
            return;
        }

        // this is the part we comment out
        //        if ($session instanceof Session ? $session->getUsageIndex() !== end($this->sessionUsageStack) : $session->isStarted()) {
        //            if ($autoCacheControl) {
        //                $response
        //                    ->setExpires(new \DateTime())
        //                    ->setPrivate()
        //                    ->setMaxAge(0)
        //                    ->headers->addCacheControlDirective('must-revalidate');
        //            }
        //        }

        if ($session->isStarted()) {
            /*
             * Saves the session, in case it is still open, before sending the response/headers.
             *
             * This ensures several things in case the developer did not save the session explicitly:
             *
             *  * If a session save handler without locking is used, it ensures the data is available
             *    on the next request, e.g. after a redirect. PHPs auto-save at script end via
             *    session_register_shutdown is executed after fastcgi_finish_request. So in this case
             *    the data could be missing the next request because it might not be saved the moment
             *    the new request is processed.
             *  * A locking save handler (e.g. the native 'files') circumvents concurrency problems like
             *    the one above. But by saving the session before long-running things in the terminate event,
             *    we ensure the session is not blocked longer than needed.
             *  * When regenerating the session ID no locking is involved in PHPs session design. See
             *    https://bugs.php.net/61470 for a discussion. So in this case, the session must
             *    be saved anyway before sending the headers with the new session ID. Otherwise session
             *    data could get lost again for concurrent requests with the new ID. One result could be
             *    that you get logged out after just logging in.
             *
             * This listener should be executed as one of the last listeners, so that previous listeners
             * can still operate on the open session. This prevents the overhead of restarting it.
             * Listeners after closing the session can still work with the session as usual because
             * Symfonys session implementation starts the session on demand. So writing to it after
             * it is saved will just restart it.
             */
            $session->save();
        }
    }
}

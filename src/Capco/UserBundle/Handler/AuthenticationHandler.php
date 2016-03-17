<?php

namespace Capco\UserBundle\Handler;

use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;


class AuthenticationHandler implements AuthenticationSuccessHandlerInterface, AuthenticationFailureHandlerInterface
{
    public function onAuthenticationSuccess(Request $request, TokenInterface $token) {
        if ($request->isXmlHttpRequest()) {
            $response = new JsonResponse(['success' => true]);
            return $response;
        }

        //return parent::onAuthenticationSuccess($request, $token);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception) {
      if ($request->isXmlHttpRequest()) {
          $response = new JsonResponse(['success' => false, 'message' => $exception->getMessage()]);
          return $response;
      }

      // return parent::onAuthenticationFailure($request, $exception);
    }
}

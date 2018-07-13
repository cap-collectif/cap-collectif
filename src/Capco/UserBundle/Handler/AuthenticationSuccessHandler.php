<?php
namespace Capco\UserBundle\Handler;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\DefaultAuthenticationSuccessHandler;
use Symfony\Component\Security\Http\HttpUtils;

class AuthenticationSuccessHandler extends DefaultAuthenticationSuccessHandler
{
    private $toggleManager;
    private $securityContext;

    public function __construct(
        HttpUtils $httpUtils,
        array $options = array(),
        Manager $toggleManager,
        TokenStorage $securityContext
    ) {
        parent::__construct($httpUtils, $options);
        $this->toggleManager = $toggleManager;
        $this->securityContext = $securityContext;
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token)
    {
        if ($request->isXmlHttpRequest()) {
            if (
                $this->toggleManager->isActive('shield_mode') &&
                $token->getUser()->getExpiresAt() > new \DateTime()
            ) {
                $this->securityContext->setToken(null);
                $request->getSession()->invalidate();
                return new JsonResponse(['success' => true, 'shieldEnabled' => true]);
            }
            return new JsonResponse(['success' => true, 'username' => $token->getUsername()]);
        }

        return parent::onAuthenticationSuccess($request, $token);
    }
}

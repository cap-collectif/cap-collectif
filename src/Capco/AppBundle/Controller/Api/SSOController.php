<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Service\OpenIDBackchannel;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SSOController extends AbstractController
{
    private readonly OpenIDBackchannel $openIDBackchannel;

    public function __construct(OpenIDBackchannel $openIDBackchannel)
    {
        $this->openIDBackchannel = $openIDBackchannel;
    }

    /**
     * @Route("/openid/backchannel/{token}", name="openid_back_channel", options={"i18n" = false}, methods={"POST"}, defaults={"_feature_flags" = "login_openid"})
     */
    public function backChannel(Request $request, string $token): JsonResponse
    {
        return $this->openIDBackchannel->__invoke($request, $token);
    }
}

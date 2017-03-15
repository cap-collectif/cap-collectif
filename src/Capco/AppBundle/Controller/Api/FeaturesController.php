<?php

namespace Capco\AppBundle\Controller\Api;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Capco\AppBundle\Form\ApiToggleType;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class FeaturesController extends FOSRestController
{
    /**
     * @Put("/toggles/{feature}")
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=200, serializerGroups={})
     */
    public function putFeatureFlagsAction(Request $request, string $feature)
    {
        $toggleManager = $this->container->get('capco.toggle.manager');
        if (!$toggleManager->exists($feature)) {
            throw $this->createNotFoundException(sprintf('The feature "%s" doesn\'t exists.', $feature));
        }
        $form = $this->createForm(new ApiToggleType());
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $data = $form->getData();
        if ($form->getData()['enabled']) {
          $toggleManager->activate($feature);
        } else {
          $toggleManager->deactivate($feature);
        }

        return [];
    }
}

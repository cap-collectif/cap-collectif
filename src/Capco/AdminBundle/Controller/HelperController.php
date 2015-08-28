<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Repository\ConsultationTypeRepository;
use Capco\AppBundle\Repository\OpinionTypeAppendixTypeRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class HelperController.
 *
 * @Route("admin/capco/helper", service="capco.admin.helper_controller")
 */
class HelperController
{
    protected $consultationTypeRepo;
    protected $opinionTypeAppendixTypeRepo;

    public function __construct(ConsultationTypeRepository $consultationTypeRepository, OpinionTypeAppendixTypeRepository $opinionTypeAppendixTypeRepo)
    {
        $this->consultationTypeRepo = $consultationTypeRepository;
        $this->opinionTypeAppendixTypeRepo = $opinionTypeAppendixTypeRepo;
    }

    /**
     * @Route("/get_allowed_types", name="capco_admin_get_allowed_types")
     *
     * @return JsonResponse
     */
    public function getAllowedTypesFromConsultationTypeAction(Request $request)
    {
        $consultationTypeId = $request->get('consultationTypeId');

        if (null == $consultationTypeId) {
            return new JsonResponse(array());
        }

        $opinionTypes = $this->consultationTypeRepo->getRelatedTypes($consultationTypeId);

        if (null == $opinionTypes) {
            return new JsonResponse(array());
        }

        return new JsonResponse($opinionTypes);
    }
}

<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

class GlobalDistrictController extends Controller
{
    private GlobalDistrictRepository $repository;

    public function __construct(GlobalDistrictRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @Route("/project-district/{slug}", name="app_project_district_show", options={"i18n" = false})
     * @Template("CapcoAppBundle:GlobalDistrict:show.html.twig")
     */
    public function showAction(string $slug)
    {
        $district = $this->getDistrict($slug);

        return ['districtId' => GlobalId::toGlobalId('District', $district->getId())];
    }

    private function getDistrict(string $slug): GlobalDistrict
    {
        $district = $this->repository->getBySlug($slug);
        if ($district instanceof GlobalDistrict) {
            return $district;
        }

        throw new NotFoundHttpException('Could not find a district for this id.');
    }
}

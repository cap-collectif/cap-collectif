<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Capco\AppBundle\Entity\Status;

class SelectionStepsController extends FOSRestController
{
    /**
     * @Get("/selection_steps/{selection_step_id}/proposals")
     * @ParamConverter("selectionStep", options={"mapping": {"selection_step_id": "id"}})
     * @QueryParam(name="first", requirements="[0-9.]+", default="0")
     * @QueryParam(name="offset", requirements="[0-9.]+", default="100")
     * @QueryParam(name="order", requirements="(old|last|popular|comments)", default="last")
     * @QueryParam(name="theme", nullable=true)
     * @QueryParam(name="status", nullable=true)
     * @QueryParam(name="district", nullable=true)
     * @QueryParam(name="type", nullable=true)
     * @View(statusCode=200, serializerGroups={"Proposals", "ProposalResponses", "UsersInfos", "UserMedias"})
     */
    public function getProposalsBySelectionStepAction(SelectionStep $selectionStep, ParamFetcherInterface $paramFetcher)
    {
        $first = intval($paramFetcher->get('first'));
        $offset = intval($paramFetcher->get('offset'));
        $order = $paramFetcher->get('order');
        $themeId = $paramFetcher->get('theme');
        $statusId = $paramFetcher->get('status');
        $districtId = $paramFetcher->get('district');
        $typeId = $paramFetcher->get('type');

        $em = $this->getDoctrine()->getManager();
        $theme = null;
        $status = null;
        $district = null;
        $type = null;

        if ($themeId) {
            $theme = $em->getRepository('CapcoAppBundle:Theme')->find($themeId);
            if (!$theme) {
                throw new \Exception('Wrong theme');
            }
        }

        if ($statusId) {
            $status = $em->getRepository('CapcoAppBundle:Status')->find($statusId);
            if (!$status) {
                throw new \Exception('Wrong status');
            }
        }

        if ($districtId) {
            $district = $em->getRepository('CapcoAppBundle:District')->find($districtId);
            if (!$district) {
                throw new \Exception('Wrong district');
            }
        }

        if ($typeId) {
            $type = $em->getRepository('CapcoUserBundle:UserType')->find($typeId);
            if (!$type) {
                throw new \Exception('Wrong type');
            }
        }

        $paginator = $em
            ->getRepository('CapcoAppBundle:Proposal')
            ->getPublishedBySelectionStep($selectionStep, $first, $offset, $order, $theme, $status, $district, $type)
        ;

        $proposals = [];
        foreach ($paginator as $proposal) {
            $proposals[] = $proposal;
        }

        return [
            'proposals' => $proposals,
            'count' => count($paginator),
        ];
    }
}

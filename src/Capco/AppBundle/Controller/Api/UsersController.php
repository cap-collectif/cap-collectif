<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\UserBundle\Entity\User;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Request\ParamFetcherInterface;

class UsersController extends FOSRestController
{
    /**
     * Get users.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get users",
     *  statusCodes={
     *    200 = "Returned when successful",
     *  }
     * )
     *
     * @Get("/users")
     * @QueryParam(name="type", nullable=true)
     * @QueryParam(name="from", nullable=true)
     * @QueryParam(name="to", nullable=true)
     * @View(serializerGroups={})
     */
    public function getUsersAction(ParamFetcherInterface $paramFetcher)
    {
        $em = $this->getDoctrine()->getManager();
        $type = $paramFetcher->get('type');
        $from = $paramFetcher->get('from');
        $to = $paramFetcher->get('to');
        $userType = null;

        if ($type) {
            $userType = $em->getRepository('CapcoUserBundle:UserType')
                           ->findOneBySlug($type);
            if (!$userType) {
                throw new BadRequestHttpException("This user type doesn't exist, please use a correct slug.");
            }
        }

        $users = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoUserBundle:User')
                    ->getEnabledWith($userType, $from, $to);

        return [
            'count' => count($users),
        ];
    }
}

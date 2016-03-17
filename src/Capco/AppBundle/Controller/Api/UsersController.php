<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\UserBundle\Entity\User;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;

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

    /**
     * Create a user.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Create a user.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *  }
     * )
     *
     * @Security("has_role('IS_AUTHENTICATED_ANONYMOUSLY')")
     * @Post("/users", defaults={"_feature_flags" = "registration"})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postUsersAction(Request $request)
    {
        $user = $this->getUser();
        $opinionVersion = (new OpinionVersion())
            ->setAuthor($user)
            ->setParent($opinion)
        ;

        $form = $this->createForm(new OpinionVersionType(), $opinionVersion);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $opinion->setVersionsCount($opinion->getVersionsCount() + 1);
            $this->getDoctrine()->getManager()->persist($opinionVersion);
            $this->getDoctrine()->getManager()->flush();

            return $opinionVersion;
        }

        $view = $this->view($form->getErrors(true), Codes::HTTP_BAD_REQUEST);

        // try {
            $this->get('fos_user.security.login_manager')->loginUser(
                $this->container->getParameter('fos_user.firewall_name'),
                $user,
                $response);
        // } catch (AccountStatusException $ex) {
            // We simply do not authenticate users which do not pass the user
            // checker (not enabled, expired, etc.).
        // }
        return $view;
    }
}

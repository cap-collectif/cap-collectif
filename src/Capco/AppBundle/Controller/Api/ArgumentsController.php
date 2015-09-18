<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\ArgumentVote;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\OpinionVersion;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Capco\AppBundle\Entity\Opinion;

class ArgumentsController extends FOSRestController
{

    /**
     * Get all arguments of an opinion for specified type.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all arguments of an opinion for specified type",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Get("/opinions/{id}/arguments")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}, "method": "getOne"})
     * @QueryParam(name="type", requirements="(0|1)", default=null)
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos"})
     */
    public function cgetOpinionArgumentsAction(Opinion $opinion, ParamFetcherInterface $paramFetcher)
    {
        $type = $paramFetcher->get('type');
        $filter = $paramFetcher->get('filter');

        $arguments = $this->getDoctrine()->getManager()
            ->getRepository('CapcoAppBundle:Argument')
            ->getByTypeAndOpinionOrderedJoinUserReports($opinion, $type, $filter, $this->getUser());

        return [
            'arguments' => $arguments,
        ];
    }

    /**
     * Get all arguments of an opinion version for specified type.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all arguments of an opinion version for specified type",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion version not found",
     *  }
     * )
     *
     * @Get("/versions/{id}/arguments")
     * @ParamConverter("version", options={"mapping": {"id": "id"}, "method": "getOne"})
     * @QueryParam(name="type", requirements="(0|1)", default=null)
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos"})
     */
    public function cgetOpinionVersionArgumentsAction(OpinionVersion $version, ParamFetcherInterface $paramFetcher)
    {
        $type = $paramFetcher->get('type');
        $filter = $paramFetcher->get('filter');

        $arguments = $this->getDoctrine()->getManager()
            ->getRepository('CapcoAppBundle:Argument')
            ->getByTypeAndOpinionVersionOrderedJoinUserReports($version, $type, $filter, $this->getUser());

        return [
            'arguments' => $arguments,
        ];
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/arguments/{argumentId}/votes")
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postArgumentVoteAction(Argument $argument, ArgumentVote $vote, ConstraintViolationListInterface $validationErrors)
    {
        if (!$argument->canContribute()) {
            throw new BadRequestHttpException('Uncontributable argument.');
        }

        $user = $this->getUser();
        $previousVote = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:ArgumentVote')
                    ->findOneBy(['user' => $user, 'argument' => $argument]);

        if ($previousVote) {
            throw new BadRequestHttpException('Already voted.');
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $vote
            ->setConfirmed(true)
            ->setArgument($argument)
            ->setUser($user)
        ;

        $argument->setVoteCount($argument->getVoteCount() + 1);
        $this->getDoctrine()->getManager()->persist($vote);
        $this->getDoctrine()->getManager()->persist($argument);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Put("/arguments/{argumentId}")
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @View(statusCode=204, serializerGroups={})
     */
    public function putArgumentAction(Request $request, Argument $argument)
    {
        if (!$argument->canContribute()) {
            throw new BadRequestHttpException('Uncontributable argument.');
        }

        if ($argument->getAuthor() != $this->getUser()) {
            throw new BadRequestHttpException('You are not the author of this argument.');
        }

        // In the future we will implement this
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/arguments/{argumentId}/votes")
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @View()
     */
    public function deleteArgumentVoteAction(Argument $argument)
    {
        if (!$argument->getLinkedOpinion()->canContribute()) {
            throw new BadRequestHttpException('Uncontributable opinion.');
        }
        $vote = $this->getDoctrine()->getManager()
                     ->getRepository('CapcoAppBundle:ArgumentVote')
                     ->findOneBy(['user' => $this->getUser(), 'argument' => $argument]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this argument.');
        }

        $argument->setVoteCount($argument->getVoteCount() - 1);
        $this->getDoctrine()->getManager()->remove($vote);
        $this->getDoctrine()->getManager()->flush();
    }
}

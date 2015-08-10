<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\ArgumentVote;
use Capco\AppBundle\Entity\Argument;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Capco\AppBundle\Form\OpinionVersionType;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Capco\AppBundle\CapcoAppBundleEvents;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\QueryParam;

use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Request\ParamFetcherInterface;

class ArgumentsController extends FOSRestController
{
    /**
     * Add an argument vote.
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/arguments/{argumentId}/votes")
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postVoteAction(Argument $argument, ArgumentVote $vote, ConstraintViolationListInterface $validationErrors)
    {
        if (!$argument->getLinkedOpinion()->canContribute()) {
            throw new BadRequestHttpException("Can't add a vote to an uncontributable opinion.");
        }

        $user = $this->getUser();
        $previousVote = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:ArgumentVote')
                    ->findOneBy(['user' => $user, 'argument' => $argument]);

        if ($previousVote) {
            throw new BadRequestHttpException("Already voted.");
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $vote
            ->setConfirmed(true)
            ->setArgument($argument)
            ->setUser($user)
        ;

        $this->getDoctrine()->getManager()->persist($vote);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * Delete an argument vote.
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/arguments/{argumentId}/votes")
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @View(statusCode=200, serializerGroups={})
     */
    public function deleteVoteAction(Argument $argument)
    {
        if (!$argument->getLinkedOpinion()->canContribute()) {
            throw new BadRequestHttpException("Can't delete a vote to an uncontributable opinion.");
        }
        $vote = $this->getDoctrine()->getManager()
                     ->getRepository('CapcoAppBundle:ArgumentVote')
                     ->findOneBy(['user' => $this->getUser(), 'argument' => $argument]);

        if (!$vote) {
            throw new BadRequestHttpException("You have not voted for this argument.");
        }

        $this->getDoctrine()->getManager()->remove($vote);
        $this->getDoctrine()->getManager()->flush();
    }

}

<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Form\OpinionsType as OpinionForm;
use Capco\AppBundle\Form\ArgumentType as ArgumentForm;
use Capco\AppBundle\Form\OpinionVoteType as OpinionVoteForm;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Form\Form;

class OpinionController extends Controller
{

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/add", name="app_consultation_new_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @param $opinionType
     * @param $consultation
     * @param $request
     * @Template("CapcoAppBundle:Opinion:create.html.twig")
     * @return array
     */
    public function createOpinionAction(Consultation $consultation, OpinionType $opinionType, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false === $opinionType->isIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $opinion = new Opinion();
        $opinion->setConsultation($consultation);
        $opinion->setAuthor($this->getUser());
        $opinion->setOpinionType($opinionType);
        $opinion->setIsEnabled(true);

        $form = $this->createForm(new OpinionForm(), $opinion);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($opinion);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your proposition has been saved'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
            }
        }

        return [
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'form' => $form->createView()
        ];
    }

    /**
     * Page opinion
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{opinion_slug}", name="app_consultation_show_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @Template("CapcoAppBundle:Opinion:show.html.twig")
     * @param Consultation $consultation
     * @param OpinionType $opinionType
     * @param Opinion $opinion
     * @param Request $request
     * @return array
     */
    public function showOpinionAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Request $request)
    {
        if (false === $opinion->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $currentUrl = $this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]);
        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOpinionWithArguments($opinion->getSlug());
        $Votes = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionVote')->getByOpinion($opinion->getSlug());
        $steps = $this->getDoctrine()->getRepository('CapcoAppBundle:Step')->findBy(array(
            'consultation' => $consultation,
            'isEnabled' => true
        ));
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->findBy(
            array('Opinion' => $opinion)
        );

        // Argument forms
        $argument = new Argument();
        $argument->setOpinion($opinion);
        $argument->setAuthor($this->getUser());

        $argumentFormYes = $this->get('form.factory')->createNamedBuilder('argumentFormYes', new ArgumentForm(), $argument)->getForm();
        $argumentFormNo = $this->get('form.factory')->createNamedBuilder('argumentFormNo', new ArgumentForm(), $argument)->getForm();

        // OpinionVote forms
        $opinionVote = null;
        $previousVote = null;
        $userHasVoted = false;

        if ($this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            $previousVote = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionVote')->findOneBy(array(
                'Voter' => $this->getUser(),
                'opinion' => $opinion
            ));
        }

        if ( $previousVote != null ){
            $opinionVote = $previousVote;
            $userHasVoted = true;
        } else {
            $opinionVote = new OpinionVote();
            $opinionVote->setOpinion($opinion);
            $opinionVote->setVoter($this->getUser());
        }

        $opinionVoteForm = $this->get('form.factory')->createNamedBuilder('opinionVoteForm', new OpinionVoteForm(), $opinionVote, ['attr' => ['id' => 'opinion_vote_form']])->getForm();


        if ('POST' === $request->getMethod()) {

            $form = null;
 
            if ($request->request->has('argumentFormYes')) {
                $argument->setType(Argument::TYPE_FOR);
                $form = $argumentFormYes;
                $this->handleCreateArgumentForm($opinion, $argument, $form, $request);
            }

            if ($request->request->has('argumentFormNo')) {
                $argument->setType(Argument::TYPE_AGAINST);
                $form = $argumentFormNo;
                $this->handleCreateArgumentForm($opinion, $argument, $form, $request);
            }

            if ($request->request->has('opinionVoteForm')) {
                $form = $opinionVoteForm;
                $this->handleOpinionVoteForm($opinion, $opinionVote, $userHasVoted, $form, $request);
            }

            return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));

        }

        return [
            'currentUrl' => $currentUrl,
            'sources' => $sources,
            'consultation' => $consultation,
            'opinion' => $opinion,
            'opinionType' => $opinion->getOpinionType(),
            'votes' => $Votes,
            'consultation_steps' => $steps,
            'argumentFormYes' => $argumentFormYes->createView(),
            'argumentFormNo' => $argumentFormNo->createView(),
            'argumentTypes' => Argument::$argumentTypes,
            'previousVote' => $previousVote,
            'opinionVoteTypes' => OpinionVote::$voteTypes,
            'opinionVoteStyles' => OpinionVote::$voteTypesStyles,
            'opinionVoteForm' => $opinionVoteForm->createView(),
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/delete/{opinion_slug}", name="app_consultation_delete_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @param $opinionType
     * @param $consultation
     * @param $request
     * @param $opinion
     * @Template("CapcoAppBundle:Opinion:delete.html.twig")
     * @return array
     */
    public function deleteOpinionAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false === $opinionType->isIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostOpinion = $opinion->getAuthor()->getId();

        if ($userCurrent !== $userPostOpinion) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot delete this contribution'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($opinion);
                $em->flush();

                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('The proposition has been deleted'));
                return $this->redirect($this->generateUrl('app_consultation_show', ['slug' => $consultation->getSlug() ]));
            }
        }

        return array(
            'opinion' => $opinion,
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'form' => $form->createView()
        );
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/edit/{opinion_slug}", name="app_consultation_edit_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @Template("CapcoAppBundle:Opinion:update.html.twig")
     * @param $request
     * @param $consultation
     * @param $opinionType
     * @param $opinion
     * @return array
     */
    public function updateOpinionAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostOpinion = $opinion->getAuthor()->getId();

        if ($userCurrent !== $userPostOpinion) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot edit this opinion, as you are not its author'));
        }

        $form = $this->createForm(new OpinionForm(), $opinion);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();

                // Get votes on opinion
                $linkedVotes = $em->getRepository('CapcoAppBundle:OpinionVote')->findByOpinion($opinion);

                foreach($linkedVotes as $vote){
                    $em->remove($vote);
                }

                $opinion->resetVotes();
                $em->persist($opinion);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('The opinion has been edited'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
            }
        }

        return [
            'form' => $form->createView(),
            'opinion' => $opinion,
            'consultation' => $consultation,
            'opinionType' => $opinionType
        ];
    }

    /**
     * @param $opinion
     * @param $opinionVote
     * @param $form
     * @param $request
     * @param $alreadyVoted
     * @return array
     */
    private function handleOpinionVoteForm(Opinion $opinion, OpinionVote $opinionVote, $alreadyVoted = false, Form $form, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException('Access restricted to authenticated users');
        }

        $form->handleRequest($request);

        if ($form->isValid()) {

            $em = $this->getDoctrine()->getManager();

            if (!$alreadyVoted) {
                $opinion->addVoteWithType($opinionVote->getValue());
                $em->persist($opinionVote);
                $em->persist($opinion);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your vote has been saved.'));
            } else {
                $previousVote = $em->getUnitOfWork()->getOriginalEntityData($opinionVote);
                if($previousVote['value'] == $opinionVote->getValue()){
                    $opinion->removeVoteWithType($opinionVote->getValue());
                    $em->persist($opinion);
                    $em->remove($opinionVote);
                    $em->flush();
                    $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('Your vote has been removed.'));
                }
                else {
                    $opinion->removeVoteWithType($previousVote['value']);
                    $opinion->addVoteWithType($opinionVote->getValue());
                    $em->persist($opinion);
                    $em->persist($opinionVote);
                    $em->flush();
                    $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your vote has been updated.'));
                }
            }

        } else {
            $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('Error. Your vote has not been saved.'));
        }
    }

    /**
     * Argument CRUD
     * @Template("CapcoAppBundle:Argument:create.html.twig")
     * @param $opinion
     * @param $argument
     * @param $form
     * @param $request
     * @return array
     */
    private function handleCreateArgumentForm(Opinion $opinion, Argument $argument, Form $form, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $form->handleRequest($request);

        if ($form->isValid()) {

            $em = $this->getDoctrine()->getManager();
            $em->persist($argument);
            $em->flush();
            $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your argument has been saved'));
        } else {
            $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('Your argument has not been saved.'));
        }
    }
}

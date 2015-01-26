<?php

namespace Capco\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Form\NewsletterSubscriptionType;

class HomepageController extends Controller
{
    /**
     * @Route("/", name="app_homepage")
     * @Template()
     */
    public function homepageAction(Request $request)
    {
        // Subscription to newsletter
        $subscription = new NewsletterSubscription;

        $form = $this->createForm(new NewsletterSubscriptionType(), $subscription);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $alreadyExists = $this->getDoctrine()->getRepository('CapcoAppBundle:NewsletterSubscription')->findOneByEmail($subscription->getEmail());
                if(null != $alreadyExists){
                    $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('homepage.newsletter.already_subscribed'));
                }
                else{
                    $em = $this->getDoctrine()->getManager();
                    $em->persist($subscription);
                    $em->flush();
                    $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('homepage.newsletter.success'));
                }
            }
            else{
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('homepage.newsletter.invalid'));
            }
            return $this->redirect($this->generateUrl('app_homepage'));

        }

        return array('form' => $form->createView());   
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template()
     */
    public function lastIdeasAction($max = 4, $offset = 0)
    {
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getLast($max, $offset);

        if (!isset($ideas[0])) {
            return new Response('');
        }

        return [ 'ideas' => $ideas ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template()
     */
    public function lastThemesAction($max = 4, $offset = 0)
    {
        $topics = $this->getDoctrine()->getRepository('CapcoAppBundle:Theme')->getLast($max, $offset);

        if (!isset($topics[0])) {
            return new Response('');
        }

        return [ 'topics' => $topics ];
    }

    /**
     * @Template()
     */
    public function socialNetworksAction()
    {
        $socialNetworks = $this->getDoctrine()->getRepository('CapcoAppBundle:SocialNetwork')->getEnabled();

        return [
            'socialNetworks' => $socialNetworks
        ];
    }
}

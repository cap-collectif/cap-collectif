<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Media;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class DefaultController extends Controller
{
    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="0", public="false")
     * @Template()
     */
    public function headerAction($max = 4, $offset = 0)
    {
    }

    /**
     * @Route("/add")
     * @Template()
     */
    public function uploadAction()
    {
        $document = new Media();
        $form = $this->createFormBuilder($document)
            ->add('file')
            ->getForm()
        ;

        if ($this->getRequest()->isMethod('POST')) {
            $form->handleRequest($this->getRequest());
            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();

                $em->persist($document);
                $em->flush();

            }
        }

        return array('form' => $form->createView());
    }
}

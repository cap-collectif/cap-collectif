<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ConsultationController extends Controller
{
    public function downloadAction()
    {
        $id = $this->get('request')->get($this->admin->getIdParameter());
        $consultation = $this->admin->getObject($id);

        if (!$consultation) {
            throw new NotFoundHttpException('Consultation not found.');
        }

        $format = $this->get('request')->get('format');

        $resolver = $this->get('capco.consultation.download.resolver');

        $content = $resolver->getContent($consultation, $format);

        if (null == $content) {
            throw new NotFoundHttpException('Wrong format');
        }

        $response = new Response($content);
        $contentType = $resolver->getContentType($format);
        $filename = $consultation->getSlug().'.'.$format;
        $response->headers->set('Content-Type', $contentType);
        $response->headers->set('Content-Disposition', 'attachment;filename='.$filename);

        return $response;
    }
}

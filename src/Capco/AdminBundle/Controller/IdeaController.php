<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\Response;

class IdeaController extends Controller
{
    public function exportVotersAction()
    {
        $idea = $this->admin->getSubject();

        $em = $this->getDoctrine()->getManager();
        $repo = $em->getRepository('CapcoAppBundle:IdeaVote');
        $anonymous = $repo->getAnonymousVotersByIdea($idea);
        $members = $repo->getMemberVotersByIdea($idea);

        $emails = [];
        foreach (array_merge($members, $anonymous) as $data) {
            if (is_array($data) && array_key_exists('email', $data)) {
                $emails[] = $data['email'];
            }
        }

        $handle = fopen('php://memory', 'rb+');
        fputcsv($handle, $emails);
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);

        return new Response($content, 200, [
            'Content-Type' => 'application/force-download',
            'Content-Disposition' => 'attachment; filename="export_voters.csv"',
        ]);
    }
}

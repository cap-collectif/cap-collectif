<?php

namespace Capco\AdminBundle\Resolver;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RecentContributionsResolver
{
    protected $em;
    protected $toggleManager;

    public function __construct(EntityManagerInterface $em, Manager $toggleManager)
    {
        $this->em = $em;
        $this->toggleManager = $toggleManager;
    }

    public function getEntityByTypeAndId($type, $id)
    {
        switch ($type) {
            case 'argument':
                $result = $this->em->getRepository('CapcoAppBundle:Argument')->find($id);

                break;
            case 'opinion':
                $result = $this->em->getRepository('CapcoAppBundle:Opinion')->find($id);

                break;
            case 'version':
                $result = $this->em->getRepository('CapcoAppBundle:OpinionVersion')->find($id);

                break;
            case 'source':
                $result = $this->em->getRepository('CapcoAppBundle:Source')->find($id);

                break;
            case 'comment':
                $result = $this->em->getRepository('CapcoAppBundle:Comment')->find($id);

                break;
            default:
                throw new NotFoundHttpException(
                    'Contribution not found for type ' . $type . ' and id ' . $id
                );

                break;
        }

        return $result;
    }

    public function getContributionByTypeAndId($type, $id)
    {
        switch ($type) {
            case 'argument':
                $result = $this->em->getRepository('CapcoAppBundle:Argument')->getArrayById($id);
                $result['title'] = 'Argument';

                break;
            case 'opinion':
                $result = $this->em->getRepository('CapcoAppBundle:Opinion')->getArrayById($id);

                break;
            case 'version':
                $result = $this->em
                    ->getRepository('CapcoAppBundle:OpinionVersion')
                    ->getArrayById($id);

                break;
            case 'source':
                $result = $this->em->getRepository('CapcoAppBundle:Source')->getArrayById($id);

                break;
            case 'comment':
                $result = $this->em->getRepository('CapcoAppBundle:Comment')->getArrayById($id);
                $result['title'] = 'Commentaire';

                break;
            default:
                $result = null;

                break;
        }

        $result['type'] = $type;

        return $result;
    }

    public function getRecentContributions($limit = null)
    {
        $opinions = $this->em->getRepository('CapcoAppBundle:Opinion')->getRecentOrdered();
        foreach ($opinions as $key => $opinion) {
            $opinions[$key]['type'] = 'opinion';
        }

        $versions = $this->em->getRepository('CapcoAppBundle:OpinionVersion')->getRecentOrdered();
        foreach ($versions as $key => $version) {
            $versions[$key]['type'] = 'version';
        }

        $arguments = $this->em->getRepository('CapcoAppBundle:Argument')->getRecentOrdered();
        foreach ($arguments as $key => $argument) {
            $arguments[$key]['title'] = 'Argument';
            $arguments[$key]['type'] = 'argument';
        }

        $sources = $this->em->getRepository('CapcoAppBundle:Source')->getRecentOrdered();
        foreach ($sources as $key => $source) {
            $sources[$key]['type'] = 'source';
        }

        $comments = $this->em->getRepository('CapcoAppBundle:Comment')->getRecentOrdered();
        foreach ($comments as $key => $comment) {
            $comments[$key]['title'] = 'Commentaire';
            $comments[$key]['type'] = 'comment';
        }

        $contributions = array_merge($opinions, $arguments, $versions, $sources, $comments);

        usort($contributions, function ($a, $b) {
            if ($a['updatedAt'] === $b['updatedAt']) {
                return 0;
            }

            return $a['updatedAt'] < $b['updatedAt'] ? +1 : -1;
        });

        if ($limit) {
            return array_splice($contributions, 0, $limit);
        }

        return $contributions;
    }
}

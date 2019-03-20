<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Notifier\ContributionNotifier;
use Capco\AdminBundle\Resolver\RecentContributionsResolver;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class RecentContributionsController extends Controller
{
    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/contributions", name="capco_admin_contributions_index")
     * @Template("CapcoAdminBundle:RecentContributions:index.html.twig")
     */
    public function indexAction()
    {
        $resolver = $this->get(RecentContributionsResolver::class);
        $contributions = $resolver->getRecentContributions();

        return [
            'contributions' => $contributions,
            'recentContributions' => true,
            'base_template' => 'CapcoAdminBundle::standard_layout.html.twig',
            'admin_pool' => $this->get('sonata.admin.pool'),
        ];
    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/contributions/{type}/{id}", name="capco_admin_contributions_show")
     * @Template("CapcoAdminBundle:RecentContributions:show.html.twig")
     *
     * @param mixed $type
     * @param mixed $id
     */
    public function showAction($type, $id)
    {
        $resolver = $this->get(RecentContributionsResolver::class);

        $contribution = $resolver->getContributionByTypeAndId($type, $id);

        if (!$contribution) {
            throw $this->createNotFoundException('Contribution not found');
        }

        return [
            'contribution' => $contribution,
            'recentContributions' => true,
            'base_template' => 'CapcoAdminBundle::standard_layout.html.twig',
            'admin_pool' => $this->get('sonata.admin.pool'),
        ];
    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/contributions/{type}/{id}/validate", name="capco_admin_contributions_validate")
     *
     * @param mixed $type
     * @param mixed $id
     */
    public function validateAction($type, $id)
    {
        $resolver = $this->get(RecentContributionsResolver::class);
        $em = $this->get('doctrine')->getManager();
        $contribution = $resolver->getEntityByTypeAndId($type, $id);

        if (!$contribution) {
            throw $this->createNotFoundException('Contribution not found');
        }

        $em->flush();

        $this->addFlash(
            'sonata_flash_success',
            $this->get('translator')->trans('admin.global.validate', [], 'CapcoAppBundle')
        );

        return $this->redirectToRoute('capco_admin_contributions_index');
    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/contributions/{type}/{id}/unpublish", name="capco_admin_contributions_unpublish")
     */
    public function unpublishAction(Request $request, $type, $id)
    {
        $resolver = $this->get(RecentContributionsResolver::class);
        $em = $this->get('doctrine')->getManager();
        $contribution = $resolver->getEntityByTypeAndId($type, $id);

        if (!$contribution) {
            throw $this->createNotFoundException('Contribution not found');
        }

        if ('POST' === $request->getMethod()) {
            $motives = $request->get('motives');
            $contribution->setTrashedStatus(Trashable::STATUS_INVISIBLE);
            $contribution->setTrashedReason($motives);
            $em->flush();
            $this->get(ContributionNotifier::class)->onModeration($contribution);

            $this->addFlash(
                'sonata_flash_success',
                $this->get('translator')->trans('admin.global.unpublish', [], 'CapcoAppBundle')
            );

            return $this->redirectToRoute('capco_admin_contributions_index');
        }

        return $this->render(
            'CapcoAdminBundle:RecentContributions:confirm.html.twig',
            [
                'type' => $type,
                'id' => $id,
                'del_action' => 'unpublish',
                'base_template' => 'CapcoAdminBundle::standard_layout.html.twig',
                'admin_pool' => $this->get('sonata.admin.pool'),
            ],
            null
        );
    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/contributions/{type}/{id}/trash", name="capco_admin_contributions_trash")
     *
     * @param mixed $type
     * @param mixed $id
     */
    public function trashAction(Request $request, $type, $id)
    {
        $resolver = $this->get(RecentContributionsResolver::class);
        $em = $this->get('doctrine')->getManager();
        $contribution = $resolver->getEntityByTypeAndId($type, $id);

        if (!$contribution) {
            throw $this->createNotFoundException('Contribution not found');
        }

        if ('POST' === $request->getMethod()) {
            $motives = $request->get('motives');
            $contribution->setTrashedStatus(Trashable::STATUS_VISIBLE);
            $contribution->setTrashedReason($motives);
            $em->flush();
            $this->get(ContributionNotifier::class)->onModeration($contribution);

            $this->addFlash(
                'sonata_flash_success',
                $this->get('translator')->trans('admin.global.trash', [], 'CapcoAppBundle')
            );

            return $this->redirectToRoute('capco_admin_contributions_index');
        }

        return $this->render(
            'CapcoAdminBundle:RecentContributions:confirm.html.twig',
            [
                'type' => $type,
                'id' => $id,
                'del_action' => 'trash',
                'base_template' => 'CapcoAdminBundle::standard_layout.html.twig',
                'admin_pool' => $this->get('sonata.admin.pool'),
            ],
            null
        );
    }
}

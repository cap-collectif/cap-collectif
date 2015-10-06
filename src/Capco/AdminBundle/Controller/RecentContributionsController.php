<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class RecentContributionsController extends Controller
{
    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/contributions", name="capco_admin_contributions_index")
     * @Template("CapcoAdminBundle:RecentContributions:index.html.twig")
     */
    public function indexAction(Request $request)
    {
        $resolver = $this->get('capco_admin.recent_contributions_resolver');

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
     */
    public function showAction(Request $request, $type, $id)
    {
        $resolver = $this->get('capco_admin.recent_contributions_resolver');

        $contribution = $resolver->getContributionByTypeAndId($type, $id);

        if (!$contribution) {
            throw new NotFoundHttpException('Contribution not found');
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
     */
    public function validateAction(Request $request, $type, $id)
    {
        $resolver = $this->get('capco_admin.recent_contributions_resolver');
        $em = $this->get('doctrine.orm.entity_manager');
        $contribution = $resolver->getEntityByTypeAndId($type, $id);

        if (!$contribution) {
            throw new NotFoundHttpException('Contribution not found');
        }

        $contribution->setValidated(true);
        $em->flush();

        $this->addFlash(
            'sonata_flash_success',
            $this->get('translator')->trans(
                'admin.global.validate',
                [],
                'SonataAdminBundle'
            )
        );

        return $this->redirectToRoute('capco_admin_contributions_index');
    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/contributions/{type}/{id}/unpublish", name="capco_admin_contributions_unpublish")
     */
    public function unpublishAction(Request $request, $type, $id)
    {
        $resolver = $this->get('capco_admin.recent_contributions_resolver');
        $em = $this->get('doctrine.orm.entity_manager');
        $contribution = $resolver->getEntityByTypeAndId($type, $id);

        if (!$contribution) {
            throw new NotFoundHttpException('Contribution not found');
        }

        if ('POST' === $request->getMethod()) {
            $motives = $request->get('motives');
            $contribution->setValidated(true);
            $contribution->setIsEnabled(false);
            $contribution->setIsTrashed(true);
            $contribution->setTrashedReason($motives);
            $contribution->setTrashedAt(new \DateTime());
            $em->flush();
            $this->get('capco.notify_manager')->notifyModeration($contribution);

            $this->addFlash(
                'sonata_flash_success',
                $this->get('translator')->trans(
                    'admin.global.unpublish',
                    [],
                    'SonataAdminBundle'
                )
            );

            return $this->redirectToRoute('capco_admin_contributions_index');
        }

        return $this->render('CapcoAdminBundle:RecentContributions:confirm.html.twig', [
            'type' => $type,
            'id' => $id,
            'del_action' => 'unpublish',
            'base_template' => 'CapcoAdminBundle::standard_layout.html.twig',
            'admin_pool' => $this->get('sonata.admin.pool'),
        ], null);
    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/contributions/{type}/{id}/trash", name="capco_admin_contributions_trash")
     */
    public function trashAction(Request $request, $type, $id)
    {
        $resolver = $this->get('capco_admin.recent_contributions_resolver');
        $em = $this->get('doctrine.orm.entity_manager');
        $contribution = $resolver->getEntityByTypeAndId($type, $id);

        if (!$contribution) {
            throw new NotFoundHttpException('Contribution not found');
        }

        if ('POST' === $request->getMethod()) {
            $motives = $request->get('motives');
            $contribution->setValidated(true);
            $contribution->setIsTrashed(true);
            $contribution->setTrashedReason($motives);
            $contribution->setTrashedAt(new \DateTime());
            $em->flush();
            $this->get('capco.notify_manager')->notifyModeration($contribution);

            $this->addFlash(
                'sonata_flash_success',
                $this->get('translator')->trans(
                    'admin.global.trash',
                    [],
                    'SonataAdminBundle'
                )
            );

            return $this->redirectToRoute('capco_admin_contributions_index');
        }

        return $this->render('CapcoAdminBundle:RecentContributions:confirm.html.twig', [
            'type' => $type,
            'id' => $id,
            'del_action' => 'trash',
            'base_template' => 'CapcoAdminBundle::standard_layout.html.twig',
            'admin_pool' => $this->get('sonata.admin.pool'),
        ], null);
    }
}

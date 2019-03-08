<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Reporting;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class RecentReportingController extends Controller
{
    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/reporting", name="admin_capco_app_reporting_index")
     * @Template("CapcoAdminBundle:RecentReporting:index.html.twig")
     */
    public function indexAction()
    {
        $resolver = $this->get('capco_admin.recent_reports_resolver');
        $reports = $resolver->getRecentReports();

        return [
            'reports' => $reports,
            'statusLabels' => Reporting::$statusesLabels,
            'recentReporting' => true,
            'base_template' => 'CapcoAdminBundle::standard_layout.html.twig',
            'admin_pool' => $this->get('sonata.admin.pool'),
            'admin' => $this->get('capco_admin.admin.reporting'),
        ];
    }
}

<?php

namespace Capco\UserBundle\Controller;

use Capco\UserBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Capco\UserBundle\Form\Type\MemberSearchType;
use Capco\UserBundle\Entity\UserType;

class MembersController extends Controller
{
    /**
     * @Route("/members/{page}", name="app_members", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flag" = "members_list"})
     * @Route("/members/{userType}/{page}", name="app_members_type", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flag" = "members_list"} )
     * @Route("/members/{userType}/{sort}/{page}", name="app_members_type_sorted", requirements={"page" = "\d+"}, defaults={"page" = 1, "userType" = null, "_feature_flag" = "members_list"} )
     * @Template()
     *
     * @param $request
     * @param $page
     * @param $userType
     * @param $sort
     *t
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function indexAction(Request $request, $page, $userType = null, $sort = null)
    {
        $currentUrl = $this->generateUrl('app_members');
        $em = $this->get('doctrine.orm.entity_manager');

        $form = $this->createForm(new MemberSearchType($this->get('capco.toggle.manager')), null, array(
            'action' => $currentUrl,
            'method' => 'POST',
        ));

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_members_type_sorted', array(
                    'userType' => $data['userType'] ? $data['userType']->getSlug() : UserType::FILTER_ALL,
                    'sort' => $data['sort'],
                )));
            }
        } else {
            $form->setData(array(
                'userType' => $em->getRepository('CapcoUserBundle:UserType')->findOneBySlug($userType),
                'sort' => $sort,
            ));
        }

        $pagination = $this->get('capco.site_parameter.resolver')->getValue('members.pagination.size');
        $pagination = is_numeric($pagination) ? (int) $pagination : 0;

        $sort = ($sort === null ? 'activity' : $sort);
        $members = $em->getRepository('CapcoUserBundle:User')->getSearchResults($pagination, $page, $sort, $userType);

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if ($pagination != 0) {
            $nbPage = ceil(count($members) / $pagination);
        }

        return [
            'members' => $members,
            'page' => $page,
            'nbPage' => $nbPage,
            'form' => $form->createView(),
        ];
    }
}

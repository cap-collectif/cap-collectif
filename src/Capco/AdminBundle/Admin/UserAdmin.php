<?php

namespace Capco\AdminBundle\Admin;

use FOS\UserBundle\Model\UserManagerInterface;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;

class UserAdmin extends CapcoAdmin
{
    protected UserManagerInterface $userManager;
    protected array $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'updatedAt'];

    public function __construct(string $code, string $class, string $baseControllerName)
    {
        parent::__construct($code, $class, $baseControllerName);
    }

    public function getBatchActions(): array
    {
        // have to get at least one batch action to display number of users
        $actions = parent::getBatchActions();
        $actions['nothing'] = [
            'label' => '',
            'translation_domain' => 'SonataAdminBundle',
            'ask_confirmation' => false,
        ];

        return $actions;
    }

    public function getExportFormats(): array
    {
        return ['csv'];
    }

    protected function configure(): void
    {
        $this->setTemplate('list', '@CapcoAdmin/User/list.html.twig');
    }

    protected function configureListFields(ListMapper $list): void
    {
        //$this->setTemplate(
        $list
            ->addIdentifier('username', null, [
                'label' => 'global.fullname',
                'template' => '@CapcoAdmin/User/username_list_field.html.twig',
            ])
            ->add('email')
            ->add('roles', null, [
                'label' => 'global.role',
                'template' => '@CapcoAdmin/User/roles_list_field.html.twig',
            ])
            ->add('enabled')
            ->add('isEmailConfirmed', null, [
                'label' => 'confirmed-by-email',
                'template' => '@CapcoAdmin/User/email_confirmed_list_field.html.twig',
            ])
            ->add('locked', null, ['editable' => true])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('deletedAccountAt', null, ['label' => 'admin.fields.proposal.deleted_at'])
        ;
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('id')
            ->add('username')
            ->add('email')
            ->add('confirmationToken')
            ->add('locked')
            ->add('phone', null, ['translation_domain' => 'CapcoAppBundle'])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->add('exportLegacyUsers', 'export_legacy_users');

        $collection->clearExcept(['batch', 'list', 'edit', 'export', 'exportLegacyUsers']);
    }
}

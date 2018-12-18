<?php
namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\CoreBundle\Model\Metadata;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;

class UserAdmin extends BaseAdmin
{
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'updatedAt'];

    public function getTemplate($name)
    {
        if ('edit' === $name) {
            return 'CapcoAdminBundle:User:edit.html.twig';
        }

        return parent::getTemplate($name);
    }

    public function getBatchActions()
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

    public function getExportFormats()
    {
        return ['csv'];
    }

    protected function configureListFields(ListMapper $listMapper): void
    {
        unset($this->listModes['mosaic']);
        $listMapper
            ->addIdentifier('username', null, ['label' => 'registration.username'])
            ->add('email')
            ->add('enabled', null)
            ->add('confirmationToken', null, [
                'label' => 'confirmed-by-email',
                'template' => 'CapcoAdminBundle:User:email_confirmed_list_field.html.twig',
            ])
            ->add('locked', null, ['editable' => true])
            ->add('updatedAt', null, ['label' => 'admin.fields.group.created_at'])
            ->add('deletedAccountAt', null, ['label' => 'admin.fields.proposal.deleted_at'])
            ->add('_action', 'actions', ['actions' => ['show' => [], 'delete' => []]]);
    }

    protected function configureDatagridFilters(DatagridMapper $filterMapper): void
    {
        $filterMapper
            ->add('id')
            ->add('username')
            ->add('email')
            ->add('confirmationToken')
            ->add('locked')
            ->add('phone', null, ['translation_domain' => 'CapcoAppBundle']);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['batch', 'list', 'edit', 'show', 'export']);
    }
}

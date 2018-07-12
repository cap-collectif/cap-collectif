<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\CoreBundle\Model\Metadata;
use Sonata\UserBundle\Admin\Model\UserAdmin as BaseAdmin;

class UserAdmin extends BaseAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'DESC',
        '_sort_by' => 'updatedAt',
    ];

    public function getTemplate($name)
    {
        if ('delete' === $name) {
            return 'CapcoAdminBundle:User:delete.html.twig';
        }

        if ('edit' === $name) {
            return 'CapcoAdminBundle:User:edit.html.twig';
        }

        return parent::getTemplate($name);
    }

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $media = $object->getMedia();
        if ($media) {
            $provider = $this->getConfigurationPool()->getContainer()->get($media->getProviderName());
            $format = $provider->getFormatName($media, 'form');
            $url = $provider->generatePublicUrl($media, $format);

            return new Metadata($object->getUsername(), null, $url);
        }

        return parent::getObjectMetadata($object);
    }

    public function getExportFormats()
    {
        return ['csv'];
    }

    /**
     * {@inheritdoc}
     */
    protected function configureListFields(ListMapper $listMapper): void
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier(
                'username',
                null,
                [
                    'label' => 'registration.username',
                ]
            )
            ->add('email')
            ->add(
                'enabled',
                null,
                [
                    'editable' => true,
                ]
            )
            ->add(
                'locked',
                null,
                [
                    'editable' => true,
                ]
            )
            ->add(
                'updatedAt',
                null,
                [
                    'label' => 'admin.fields.group.created_at',
                ]
            )
            ->add(
                'deletedAccountAt',
                null,
                [
                    'label' => 'admin.fields.proposal.deleted_at',
                ]
            )
            ->add(
                '_action',
                'actions',
                [
                    'actions' => [
                        'show' => [],
                        'delete' => [],
                    ],
                ]
            );
    }

    /**
     * {@inheritdoc}
     */
    protected function configureDatagridFilters(DatagridMapper $filterMapper): void
    {
        $filterMapper
            ->add('id')
            ->add('username')
            ->add('email')
            ->add('enabled')
            ->add('locked')
            ->add(
                'phone',
                null,
                [
                    'translation_domain' => 'CapcoAppBundle',
                ]
            );
    }

    /**
     * {@inheritdoc}
     */
    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list', 'edit', 'show', 'delete']);
    }
}

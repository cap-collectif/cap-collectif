<?php

namespace Capco\AppBundle\Command\Utils;

final class ExportUtils
{
    public const SNAPSHOT_DATETIME_PLACEHOLDER = '@datetime@';

    private $snapshot = false;

    public function enableSnapshotMode(): self
    {
        $this->snapshot = true;

        return $this;
    }

    public function disableSnapshotMode(): self
    {
        $this->snapshot = false;

        return $this;
    }

    public function parseCellValue($value)
    {
        if (!\is_array($value)) {
            if (\is_bool($value)) {
                return true === $value ? 'Yes' : 'No';
            }
            if ($this->snapshot && \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $value)) {
                return self::SNAPSHOT_DATETIME_PLACEHOLDER;
            }

            return $value;
        }

        return $value;
    }
}

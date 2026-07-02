import { defineServices } from 'duneta/server/container';
import { HealthController } from 'duneta/server/http';

export const registerServices = defineServices({
  controllers: {
    HealthController,
  },
});
